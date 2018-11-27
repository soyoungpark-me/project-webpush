const authCtrl = require('../controllers/AuthCtrl');
const gradeCtrl = require('../controllers/GradeCtrl');

module.exports = (router) => {
  router.route('/grades/:idx')               
    .get(authCtrl.auth, gradeCtrl.selectOne)       // 상세정보 조회
    
  router.route('/grades')              
    .post(authCtrl.auth, gradeCtrl.save)           // 새로 저장
    .get(authCtrl.auth, gradeCtrl.selectAll)       // 전체 정보 조회

  return router;
};