const Hapi = require("@hapi/hapi");





const server = Hapi.server({
	port: 5000,
	host: "localhost",
	routes: {
		cors: {
			origin: ["*"], // an array of origins or 'ignore'
			credentials: true, // boolean - 'Access-Control-Allow-Credentials'
		},
	},
});

module.exports = server;
