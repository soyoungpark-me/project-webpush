const mongoose = require('mongoose');

let Schema = {};

Schema.createSchema = (mongoose) => {
  const notiSchema = mongoose.Schema({
    idx: { type: Number, index: { unique: true } },
    contents: { type: String, required: true },
    grade: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'grade' },
      name: { type: String, required: true }
    },
    created_at : { type : Date, index: { unique : false }, default: Date.now }
  });
  
  /*******************
   * 메소드 시작
  ********************/

  const select = {
    __v: false,
    _id: false
  };

  notiSchema.pre('save', function(next) {
    let doc = this;
    
    global.utils.mongo.seqModel.findByIdAndUpdate(
      {_id: "noti"}, {$inc: {idx: 1}}, {upsert: true, new: true}, function(err, count) {

      if (err) {
        console.log(err);
        return next(err);
      }
      
      doc.idx = count.idx;
      next();
    });
  });

  /*******************
   * selectOne: 공지 하나 상세 조회하기
   * @param: idx
   ********************/
  notiSchema.static('selectOne', function(idx, callback) {
    return this.findOne({ idx }, select, callback);
  });

  /*******************
   * selectAll: 공지 전체 조회하기
   ********************/
  notiSchema.static('selectAll', function(callback) {
    return this.find({}, { _v: false }, callback);
  });

  return notiSchema;
};

module.exports = Schema;