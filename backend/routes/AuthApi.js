const authCtrl = require('../controllers/AuthCtrl');

module.exports = (router) => {
  router.route('/auth').get(authCtrl.auth);                 // 토큰 인증

  return router;
};