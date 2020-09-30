const server = require('../hapi_server');
const Bcrypt = require('bcrypt');
const Partner = require('../model/Partner');
const start = async () => {
  const validate = async (decoded, req, h) => {
    let isValid = false;
    try {
      const id = decoded.id;

      const task = await Partner.findById(id);
      if (task) {
        isValid = true;
        req.decoded = decoded;
      }
    } catch {}

    return { isValid };
  };
  await server.register(require('hapi-auth-jwt2'));

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_KEY,

    validate,
    verifyOptions: { ignoreExpiration: true },
  });
};

module.exports = start;
