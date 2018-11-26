const userCtrl = require('../controllers/UserCtrl');
const authCtrl = require('../controllers/AuthCtrl');

module.exports = (router) => {
  router.route('/users/:idx')               
    .get(userCtrl.selectOne)       // 상세정보 조회
    .put(authCtrl.auth, userCtrl.update);      // 유저 정보 수정
    
  router.route('/users/login')              
    .post(userCtrl.login);                     // 로그인

  router.route('/users/register')           
    .post(userCtrl.register);                  // 회원가입

  return router;
};