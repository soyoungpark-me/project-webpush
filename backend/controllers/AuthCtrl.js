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

/**
 * 컨트롤러는 클라이언트로부터 요청을 받아서,
 * 해당 요청을 처리하기 위한 DB 작업은 모델에게 위임한다.
 * 모델이 해당 DB 작업을 완료해 결과값을 돌려주면,
 * 이를 적절하게 처리해 클라이언트에게 응답한다.
 * 
 * auth에서는, 클라이언트에게 header를 통해 JWT 토큰을 받아 유효한지 확인한다.
 * 1. header에 토큰이 포함되어 있지 않을 경우, 토큰이 유효하지 않을 경우에는 에러 코드를 반환하고,
 * 2. 토큰이 유효할 경우에는 인증이 된 것이므로, 
 *    JWT payload를 통해 해당 유저의 정보를 얻어서 req 객체에 담아 다음 로직에서 쓸 수 있도록 한다.
 */