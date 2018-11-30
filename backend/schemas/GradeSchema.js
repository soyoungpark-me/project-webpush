const mongoose = require('mongoose');

let Schema = {};

Schema.createSchema = (mongoose) => {
  const gradeSchema = mongoose.Schema({
    idx: { type: Number, index: { unique: true } },
    name: { type: String, required: true, index: { unique: true } },
    condition: { type: String, required: true },
    activated: { type: Boolean, required: true, default: true }
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

  /*******************
   *  selectOne : 하나 상세 조회하기
   *  @param: idx
   ********************/
  gradeSchema.static('selectOne', function(idx, callback) {
    return this.findOne({ idx: parseInt(idx) }, callback);
  });

  /*******************
   *  selectOneByName : name으로 하나 상세 조회하기
   *  @param: name
   ********************/
  gradeSchema.static('selectOneByName', function(name, callback) {
    console.log("name: " + name)
    return this.findOne({ name }, select, callback);
  });


  /*******************
   *  selectAll : 전체 조회하기
   ********************/
  gradeSchema.static('selectAll', function(callback) {
    return this.find({}, { _v: false }, callback);
  });

  /*******************
   *  check : 해당 등급이 활성화되어 있는지 확인
   *  @param: name
   ********************/
  gradeSchema.static('check', function(name, callback) {
    return this.findOne({ name }, { _id: true, name: true, activated: true }, callback);
  });

  return gradeSchema;
};

module.exports = Schema;