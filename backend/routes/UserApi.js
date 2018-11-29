const authCtrl = require('../controllers/AuthCtrl');
const userCtrl = require('../controllers/UserCtrl');

module.exports = (router) => {  
  router.route('/users/noties')               
    .get(authCtrl.auth, userCtrl.selectNoties)  // 해당 유저의 공지 조회
    .put(authCtrl.auth, userCtrl.checkNoti);    // 해당 유저의 공지 확인 처리
    
  router.route('/users/:idx')               
    .get(authCtrl.auth, userCtrl.selectOne);    // 상세정보 조회
    
  router.route('/users/login')              
    .post(userCtrl.login);                      // 로그인

  router.route('/users/register')           
    .post(userCtrl.register);                   // 회원가입

  return router;
};