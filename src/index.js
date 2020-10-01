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
