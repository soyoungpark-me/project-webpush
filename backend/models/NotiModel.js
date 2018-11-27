const mongo = global.utils.mongo;

/*******************
 * save: 공지 저장하기
 * @param: notiData = { grade: { _id, name }, contents }
 ********************/
exports.save = (notiData) => {  
  return new Promise((resolve, reject) => {
    const noti = new mongo.notiModel(
      {
        grade: notiData.grade,
        contents: notiData.contents
      }
    );

    // 3. save로 저장
    noti.save((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          saved: true,
          object: result
        });
      }
    });
  });
};



/*******************
 * selectOne: 공지 하나 상세 조회하기
 * @param: idx
 ********************/
exports.selectOne = (idx) => {
  return new Promise((resolve, reject) => {      
    mongo.notiModel.selectOne(idx, (err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while selecting Notification: " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
    });
  });
};


/*******************
 * selectAll: 공지 전체 조회하기
 ********************/
exports.selectAll = () => {
  return new Promise((resolve, reject) => {      
    mongo.notiModel.selectAll((err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while selecting All Notifications: " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
    });
  });
};