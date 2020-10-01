const axios = require("axios");
const server = require("../hapi_server");
const xml2js = require("xml2js");
const moment = require("moment");
const Joi = require("@hapi/joi");
// const { parseString } = require("xml2js");
const jonsonParser = new xml2js.Parser({ explicitArray: false });
const TransactionHistoryRequest = require("../model/TransactionHistoryRequest");
const { performance } = require("perf_hooks");

const getSignature = async (reqn, purse) => {
  const sign = await axios.get("http://localhost/", {
    params: { plainText: `${purse}${reqn}` },
  });
  return sign.data;
};
const getWMParamXML = (option_field, option_value, reqn, sign) => {
  //DECLARE OBJECT PARAM TO SEND TO X_3
  const reqPayload = {
    "w3s.request": {
      reqn,
      wmid: process.env.WMID,
      sign,
      [option_field]: option_value,
    },
  };
  // CONVERT OBJECT TO XML
  const builder = new xml2js.Builder();
  const xml = builder.buildObject(reqPayload);

  return xml;
};
const parseStringASync = (xml) => {
  return new Promise((resolve) => {
    jonsonParser.parseString(xml, (err, result) => {
      resolve(result);
    });
  });
};

const requestToWMandGetTimePerformance = async (url, xml) => {
  try {
    const start_time = performance.now();
    const wm_response = await axios.post(url, xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
    const end_time = performance.now();
    const duration = (end_time - start_time) / 1000;

    return { response: wm_response.data, duration };
  } catch (error) {
    console.log(error);
  }
};

const getReqn = async () => {
  let reqn = await TransactionHistoryRequest.find({}, "_id")
    .sort({ _id: -1 })
    .limit(1);
  reqn = reqn[0]._id + 1;
  return reqn;
};
const saveRequest = async (content, duration) => {
  const transactHistory = new TransactionHistoryRequest({
    content,
    duration,
  });
  await transactHistory.save();
};

const parseResponseToJson = async (response, option) => {
  // PARSE RESPONSE FROM XML TO JSON
  let wm_response_json = await parseStringASync(response);

  //CHECK IF WM RETURN ERROR
  if (wm_response_json["w3s.response"][`${option}s`]) {
    wm_response_json = wm_response_json["w3s.response"][`${option}s`][option];
  }

  // CONVERT TO ARRAY IF NO ERROR AND NO RECORS
  wm_response_json = !wm_response_json ? [] : wm_response_json;

  // CONVERT TO ARRAY IF NO ERROR AND ONLY ONE  RECORED
  wm_response_json =
    wm_response_json.length === undefined //check is it only record(the response return arr if more than 1 record, object if only 1 record)
      ? [wm_response_json]
      : wm_response_json;

  //check if response is array
  if (Array.isArray(wm_response_json)) {
    wm_response_json.forEach((item) => {
      delete item["$"];
    });
  }

  return wm_response_json;
};

const handleRequest = async (
  option_request,
  option_request_value,
  url,
  option_response,
  purse = process.env.PURSE
) => {
  // get max reqn +1
  const reqn = await getReqn();
  // sign purse+ren
  const sign = await getSignature(reqn, purse);

  //DECLARE XML PARAM TO SEND TO X_?
  const xml = getWMParamXML(option_request, option_request_value, reqn, sign);

  //REQUEST TO X_? AND GET TIME TAKEN
  const { response, duration } = await requestToWMandGetTimePerformance(
    url,
    xml
  );

  //SAVE X_? REQUEST TO DATABASE
  await saveRequest(response, duration);

  //PARSE XML RESPONSE TO JSON
  const json_resonse = parseResponseToJson(response, option_response);

  // RETURN ARRAY CONTAINING OPERATION
  return json_resonse;
};

const wm_route = () => {
  const wmPath = "/wm";

  const config_route = (method, path, handler, route_options = {}) => {
    server.route({
      method,
      path,
      handler,
      options: {
        tags: ["api"],
        cors: {
          credentials: true,
        },
        ...route_options,
      },
    });
  };
  //---------------------X3-----------------//
  config_route(
    "post",
    `${wmPath}/x3`,
    async (req, h) => {
      let { startDate, endDate } = req.payload;
      startDate = moment(startDate).format("YYYYMMDD hh:mm:ss");
      endDate = moment(endDate).format("YYYYMMDD hh:mm:ss");

      // try {
      const response = await handleRequest(
        "getoperations",
        {
          purse: process.env.PURSE,
          datestart: startDate,
          datefinish: endDate,
        },
        process.env.X_3,
        "operation"
      );

      // RETURN ARRAY CONTAINING OPERATION
      return response;
      // }
      // catch (error) {
      //   console.log(error);
      //   return error.message;
      // }
    },
    {
      description: "X3.Receiving Transaction History",
      notes: "Receiving Transaction History. Checking Transaction Status.",
      validate: {
        payload: Joi.object({
          startDate: Joi.date().required(),
          endDate: Joi.date().required(),
        }),
      },
    }
  );

  //---------------------X4-----------------//
  config_route(
    "post",
    `${wmPath}/x4`,
    async (req, h) => {
      try {
        let { startDate, endDate } = req.payload;
        startDate = moment(startDate).format("YYYYMMDD hh:mm:ss");
        endDate = moment(endDate).format("YYYYMMDD hh:mm:ss");
        const response = await handleRequest(
          "getoutinvoices",
          {
            purse: process.env.PURSE,
            datestart: startDate,
            datefinish: endDate,
          },
          process.env.X_4,
          "outinvoice"
        );

        // RETURN ARRAY CONTAINING OPERATION
        return response;
      } catch (error) {
        console.log(error);
        return error.message;
      }
    },
    {
      description: "X4.Receiving the history of issued invoices",
      notes:
        "Receiving the history of issued invoices. Verifying whether invoices were paid.",
      validate: {
        payload: Joi.object({
          startDate: Joi.date().required(),
          endDate: Joi.date().required(),
        }),
      },
    }
  );

  //---------------------X9-----------------//
  config_route(
    "post",
    `${wmPath}/x9`,
    async (req, h) => {
      const response = await handleRequest(
        "getpurses",
        {
          wmid: process.env.WMID,
        },
        process.env.X_9,
        "purse",
        process.env.WMID
      );
      return response;
    },
    {
      description: "X9.Retrieving information about purse balance",
      notes: "Retrieving information about purse balance",
    }
  );
};

module.exports = wm_route;
