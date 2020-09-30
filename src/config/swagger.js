const server = require("../hapi_server");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");
const Pack = require("../../package");
const start = async () => {
	const swaggerOptions = {
		info: {
			title: "Test API Documentation",
			version: Pack.version,
		},
	};
	await server.register([
		Inert,
		Vision,
		{
			plugin: HapiSwagger,
			options: swaggerOptions,
		},
	]);
};

module.exports = start;
