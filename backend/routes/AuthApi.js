const authCtrl = require('../controllers/AuthCtrl');

module.exports = (router) => {
  router.route('/auth').get(authCtrl.auth);                 // 토큰 인증

  return router;
};

/**
 * 각 Api 모듈들은 index.js로부터 router 객체를 받아와서,
 * 해당 router에 자신이 가지고 있는 컨트롤러의 함수들을 참조시킨 뒤,
 * router를 반환한다.
 * 
 * AuthCtrl 안에는 auth 함수가 exports.auth로 모듈화 되어있다.
 * 
 * 컨트롤러는 이렇게 각 함수들을 개별적으로 exports하기 때문에, 
 * 컨트롤러이름.함수명 으로 해당 함수를 호출해서 사용할 수 있다.
 */