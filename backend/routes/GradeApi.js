const gradeCtrl = require('../controllers/GradeCtrl');

module.exports = (router) => {
  router.route('/grades/:idx')               
    .get(gradeCtrl.selectOne)       // 상세정보 조회
    
  router.route('/grades')              
    .post(gradeCtrl.save)                     // 새로 저장
    .get(gradeCtrl.selectAll)                  // 전체 정보 조회

  return router;
};