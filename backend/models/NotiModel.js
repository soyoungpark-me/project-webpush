const mongo = global.utils.mongo;

/*******************
 *  save
 *  @param: notiData = { grade: { _id, name }, contents }
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


