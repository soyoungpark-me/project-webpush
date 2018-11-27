const mongo = global.utils.mongo;

/*******************
 *  save
 *  @param: gradeData = { name, condition }
 ********************/
exports.save = (gradeData) => {  
  return new Promise((resolve, reject) => {
    const grade = new mongo.gradeModel(
      {
        name: gradeData.name,
        condition: gradeData.condition
      }
    );

    // 3. save로 저장
    grade.save((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};


/*******************
 *  SelectOne
 *  @param: idx
 ********************/
exports.selectOne = (idx) => {
  return new Promise((resolve, reject) => {      
    mongo.gradeModel.selectOne(idx, (err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while selecting Grade: " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
    });
  });
};


/*******************
 *  selectAll
 ********************/
exports.selectAll = () => {
  return new Promise((resolve, reject) => {      
    mongo.gradeModel.selectAll((err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while selecting All Grade: " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
    });
  });
};


/*******************
 *  check
 *  @param: name
 ********************/
exports.check = (name) => {  
  return new Promise((resolve, reject) => {
    mongo.gradeModel.check(name, (err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while check Grade: " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
    });
  });
};