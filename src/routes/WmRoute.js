const axios = require("axios");
const server = require("../hapi_server");
const xml2js = require("xml2js");
const { parseString } = require("xml2js");
const jonsonParser = new xml2js.Parser({ explicitArray: false });
const TransactionHistoryRequest = require("../model/TransactionHistoryRequest");

const parseStringASync = (xml) => {
  return new Promise((resolve) => {
    console.log(xml);
    parseString(xml, (err, result) => {
      console.log(result);
      resolve(result);
    });
  });
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

  config_route(
    "get",
    wmPath,
    async (req, h) => {
      try {
        const purse = "V088593463806";
        const transactHistory = new TransactionHistoryRequest();
        await transactHistory.save({});
        let reqn = await TransactionHistoryRequest.find({}, "_id")
          .sort({ _id: -1 })
          .limit(1);
        reqn = reqn[0]._id + 1;

        const sign = await axios.get("http://localhost/", {
          params: { plainText: `${purse}${reqn}` },
        });

        const reqPayload = {
          "w3s.request": {
            reqn,
            wmid: process.env.WMID,
            sign: sign.data,
            getoperations: {
              purse,
              datestart: "20190511 05:12:23",
              datefinish: "20190811 05:12:23",
            },
          },
        };

        const builder = new xml2js.Builder();

        const xml = builder.buildObject(reqPayload);

        const wm_response = await axios.post(process.env.X_3, xml, {
          headers: {
            "Content-Type": "application/xml",
          },
        });

        wm_response_json = await parseStringASync(wm_response.data);
        // console.log(wm_response_json);
        //return h.response(wm_response.data).type("application/xml");
        return wm_response_json;
      } catch (error) {
        console.log(error.message);
        return error;
      }
    },
    {
      description: "test",
      notes: "test",
    }
  );
};

module.exports = wm_route;
