const mongoose = require('mongoose');

let Schema = {};

Schema.createSchema = (mongoose) => {
  const notiSchema = mongoose.Schema({
    idx: { type: Number, index: { unique: true } },
    contents: { type: String, required: true },
    confirmed: { type: Number, required: true, default: 0 },
    created_at : { type : Date, index: { unique : false }, default: Date.now }
  });
  
  /*******************
   * 메소드 시작
  ********************/

  notiSchema.pre('noti', function(next) {
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

  // selectOne : 하나 조회하기
  notiSchema.static('selectOne', function(idx, callback) {
    return this.find({ idx: parseInt(idx) }, callback);
  });

  return notiSchema;
};

module.exports = Schema;