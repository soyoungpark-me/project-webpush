const authCtrl = require('../controllers/AuthCtrl');
const notiCtrl = require('../controllers/NotiCtrl');

module.exports = (router) => {
  router.route('/noties/:idx')               
    .get(authCtrl.auth, notiCtrl.selectOne)       // 상세정보 조회
    
  router.route('/noties')              
    .post(authCtrl.auth, notiCtrl.save)           // 새로 저장
    .get(authCtrl.auth, notiCtrl.selectAll)       // 전체 정보 조회

  return router;
};