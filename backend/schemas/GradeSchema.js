const mongoose = require('mongoose');

let Schema = {};

Schema.createSchema = (mongoose) => {
  const gradeSchema = mongoose.Schema({
    idx: { type: Number, index: { unique: true } },
    name: { type: String, required: true },
    condition: { type: String, required: true }
  });
  
  /*******************
   * 메소드 시작
  ********************/

  gradeSchema.pre('grade', function(next) {
    let doc = this;
    
    global.utils.mongo.seqModel.findByIdAndUpdate(
      {_id: "grade"}, {$inc: {idx: 1}}, {upsert: true, new: true}, function(err, count) {

      if (err) {
        console.log(err);
        return next(err);
      }
      
      doc.idx = count.idx;
      next();
    });
  });

  // selectOne : 하나 조회하기
  gradeSchema.static('selectOne', function(idx, callback) {
    return this.find({ idx: parseInt(idx) }, callback);
  });

  return gradeSchema;
};

module.exports = Schema;