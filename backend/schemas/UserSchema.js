const mongoose = require('mongoose');

let Schema = {};

Schema.createSchema = (mongoose) => {
  const userSchame = mongoose.Schema({
    idx: { type: Number, index: { unique: true } },
    id: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, require: true },
    grade: { type: mongoose.Schema.Types.ObjectId, ref: 'grade' },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'noti' }],
    created_at : { type : Date, index: { unique : false }, default: Date.now }
  });
  
  /*******************
   * 메소드 시작
  ********************/

  const select = {
    __v: false,
    _id: false
  };

  userSchame.pre('save', function(next) {
    let doc = this;
    
    global.utils.mongo.seqModel.findByIdAndUpdate(
      {_id: "user"}, {$inc: {idx: 1}}, {upsert: true, new: true}, function(err, count) {

      if (err) {
        console.log(err);
        return next(err);
      }
      
      doc.idx = count.idx;
      next();
    });
  });

  // selectOne : 하나 조회하기
  userSchame.static('selectOne', function(idx, callback) {
    return this.findOne({ idx }, select)
      .populate('grade', 'name condition')
      .populate('notifications', 'grade.name contents confirmed created_at')
      .exec(callback);  
  });

  // selectOneById : id로 하나 조회하기
  userSchame.static('selectOneById', function(id, callback) {
    return this.findOne({ id }, select, callback);
  });

  // selectSalt : salt 조회하기
  userSchame.static('selectSalt', function(id, callback) {
    return this.findOne({ id }, { salt: true }, callback);
  });

  /*******************
   * login : 로그인하기
   * @param: userData = { id, password }
   ********************/
  userSchame.static('login', function(userData, callback) {
    return this.findOne({ id: userData.id, password: userData.password }, 
      { _id: false, idx: true, id: true, created_at: true }, callback);
  });

  /*******************
   * newNoti : 새 공지 저장하기
   * @param: notiData = { notiId, gradeId }
   ********************/
  userSchame.static('newNoti', function(notiData, callback) {
    this.update({ grade: notiData.gradeId }, 
      { $push: { notifications: notiData.notiId } }, 
      { new: true }, callback);
  });

  return userSchame;
};

module.exports = Schema;