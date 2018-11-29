const jwt = require('jsonwebtoken');

/*******************
 *  auth: 해당 토큰이 유효한 토큰인지 확인합니다.
 *  @param: token
 ********************/
exports.auth = (token, done) => {
  jwt.verify(token, process.env.JWT_CERT, (err, decoded) => {
    if (err) {
      let customErr = '';

      switch (err.message) { // jwt 모듈에서 주는 오류에 맞춰서 에러 코드를 반환합니다.
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