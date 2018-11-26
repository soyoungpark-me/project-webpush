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
  userSchame.static('selectOne', function(id, callback) {
    return this.find({ id }, callback);
  });

  // selectAll : 전체 조회하기
  userSchame.static('selectAll', function(blocks, page, callback) {
    if (!page) { // 페이지 인자가 없음 : 페이지네이션이 되지 않은 경우
      return this.find({ 'user.idx': { $nin: blocks }}, callback)
        .sort('-idx');
    } else {     // 페이지 인자가 있음 : 페이지네이션 적용
      return this.find({ 'user.idx': { $nin: blocks }}, callback)
        .sort('-idx')
        .skip((page-1) * paginationCount).limit(paginationCount);
    }
  });

  return userSchame;
};

module.exports = Schema;