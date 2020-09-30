const server = require("./hapi_server");

const wmRoute = require("./routes/WmRoute");
const swagger = require("./config/swagger.js");

//config env variable
const dotenv = require("dotenv");

dotenv.config();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const init = async () => {
  //config routing

  wmRoute();
  //config swagger
  await swagger();
  //start server
  server
    .start()
    .then(() => console.log("Server running on %s", server.info.uri));
};

init();

// //library em viết
// const sendSMS = (smsList, io) => {
// 	const isSendSMSSuccess = true;

// 	//set up việc emit event gửi tin nhắn cho từng sms
// 	const msgQueue = async.queue(sms, (callback) => {
// 		try {
// 			// emit sự kiện gửi tin nhắn
// 			io.emit("sendSMS", sms);

// 			//nhận kết quả gửi tin nhắn có thành công không
// 			io.on("receiveResult", (id) => {
// 				if (!id) {
// 					isSendSMSSuccess = false;
// 				}
// 			});

// 			callback();
// 		} catch (error) {
// 			isSendSMSSuccess = false;
// 		}
// 	});

// 	//push tin nhắn vào Queue
// 	smsList.forEach((sms) => {
// 		msgQueue.push(sms, () => console.log("---sent---"));
// 	});
// 	//trả về true nếu gửi tin nhắn thành công
// 	return isSendSMSSuccess;
// };
