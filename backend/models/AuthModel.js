const jwt = require('jsonwebtoken');

const redis = global.utils.redis;
const helpers = require('../utils/helpers');

/*******************
 *  Authenticate
 *  @param: (Access) token
 ********************/
exports.auth = (token, done) => {
  jwt.verify(token, process.env.JWT_CERT, (err, decoded) => {
    if (err) {
      let customErr = '';

      switch (err.message) {
        case 'jwt expired':
          return done(11400);
        case 'invalid token':        
          return done(12400);
        case 'jwt malformed':
          return done(12400);
        default:
          return done(err.message);
      }
    } else {
      const userData = {
        idx: decoded.idx,
        id: decoded.id
      }
      done(null, userData);
    }
  });
};