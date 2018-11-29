const authModel = require('../models/AuthModel');
const errorCode = require('../utils/error').code;

let tokenError = {
  name:'tokenError',
  errors:{}
};

/*******************
 *  auth: 해당 토큰이 유효한 토큰인지 확인합니다.
 ********************/
exports.auth = (req, res, next) => {
  if (!req.headers.token) {
    tokenError.errors = { message : 'Access Token is required' };
    return res.status(errorCode[10400].status)
              .json(errorCode[10400].contents);
  } else {
    authModel.auth(req.headers.token, (err, userData) => {
      if (err) {
        console.log(err);
        return res.status(errorCode[err].status)
                  .json(errorCode[err].contents);
      } else {
        req.userData = userData;
        return next();
      }
    });
  }
};