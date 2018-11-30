const mongoose = require('mongoose');

let Schema = {};

Schema.createSchema = (mongoose) => {
  const userSchame = mongoose.Schema({
    idx: { type: Number, index: { unique: true } },
    id: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, require: true },
    grade: { type: mongoose.Schema.Types.ObjectId, ref: 'grade' },
    admin: { type: Boolean, require: true, default: false },
    notifications: [{ 
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'noti' },
      confirmed: { type: Boolean, required: true, default: false }
    }],
    created_at : { type : Date, index: { unique : false }, default: Date.now }
  });
  
  /*******************
   * 메소드 시작
  ********************/

  const select = {
    __v: false,
    _id: false,
    password: false,
    salt: false
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

  /*******************
   *  selectOne : 하나 상세 조회하기
   *  @param: idx
   ********************/
  userSchame.static('selectOne', function(idx, callback) {
    return this.findOne({ idx }, select)
      .populate('grade', 'name condition')
      .populate('notifications', 'grade.name contents confirmed created_at')
      .exec(callback);  
  });

  /*******************
   *  selectOneById : ID로 하나 상세 조회하기
   *  @param: id
   ********************/
  userSchame.static('selectOneById', function(id, callback) {
    return this.findOne({ id }, select, callback);
  });

  /*******************
   *  selectSalt : 해당 유저의 Salt 조회하기
   *  @param: id
   ********************/
  userSchame.static('selectSalt', function(id, callback) {
    return this.findOne({ id }, { salt: true }, callback);
  });

  /*******************
   *  selectNoties: 해당 유저의 공지 리스트 조회
   *  @param: idx
   ********************/
  userSchame.static('selectNoties', function(idx, callback) {
    return this.findOne({ idx }, { notifications: true })
      .populate('notifications._id', 'grade.name contents confirmed created_at')
      .exec(callback);
  });

  /*******************
   *  login : 로그인하기
   *  @param: userData = { id, password }
   ********************/
  userSchame.static('login', function(userData, callback) {
    return this.findOne({ id: userData.id, password: userData.password }, 
      { _id: false, idx: true, id: true, admin: true, created_at: true }, callback);
  });

  /*******************
   *  newNoti : 새 공지 저장하기
   *  @param: notiData = { notiId, gradeId }
   ********************/
  userSchame.static('newNoti', function(notiData, callback) {
    this.updateMany({ grade: notiData.gradeId }, 
      { $push: { notifications: { _id: notiData.notiId }}}, 
      { new: true }, callback);
  });

  /*******************
   *  checkNoti: 해당 유저의 해당 공지 확인 처리
   *  @param: data = { idx, noti }
   ********************/
  userSchame.static('checkNoti', function(data, callback) {
    this.findOneAndUpdate({ 'idx': data.idx, 'notifications._id': data.noti }, 
      { $set: { 'notifications.$.confirmed': true }}, 
      { new: true }, callback);
  });

  return userSchame;
};

module.exports = Schema;