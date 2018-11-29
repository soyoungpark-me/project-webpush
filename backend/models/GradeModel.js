const mongo = global.utils.mongo;

/*******************
 *  save: 새로운 등급을 저장합니다.
 *  @param gradeData = { name, condition }
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
 *  selectOne: 해당 등급을 상세하게 조회합니다.
 *  @param idx: 조회하고자 하는 등급의 인덱스 번호
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
 *  selectAll: 등록된 모든 등급을 조회합니다.
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
 *  check: 해당 등급이 유효한 (사용 가능한) 것인지 확인합니다.
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