const mongoose = require('mongoose');

let Schema = {};

Schema.createSchema = (mongoose) => {
  const gradeSchema = mongoose.Schema({
    idx: { type: Number, index: { unique: true } },
    name: { type: String, required: true },
    color: { type: String, required: true },
    condition: { type: String, required: true }
  });
  
  /*******************
   * 메소드 시작
  ********************/
  const select = {
    __v: false,
    _id: false
  };

  gradeSchema.pre('save', function(next) {
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
    return this.findOne({ idx: parseInt(idx) }, callback);
  });

  // selectAll : 모두 조회하기
  gradeSchema.static('selectAll', function(callback) {
    return this.find({}, select, callback);
  })

  return gradeSchema;
};

module.exports = Schema;