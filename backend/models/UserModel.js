const mysql = global.utils.mysql;
const mongo = global.utils.mongo;
const redis = global.utils.redis;
const helpers = require('../utils/helpers');

const jwt = require('jsonwebtoken');


/*******************
 *  Register
 *  @param: userData = { id, password, salt }
 ********************/
exports.register = (userData) => {
  // 1. 아이디 중복 체크하기
  return new Promise((resolve, reject) => {
    mongo.userModel.selectOneById(userData.id, (err, result) => {
      if (err) {
        const customErr = new Error("Error occrred while selecting User by ID : " + err);
        reject(customErr);        
      } else {
        if (result) {
          reject(21400);
        } else {
          resolve(result);
        }
      }
    })
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      mongo.gradeModel.selectOne(1, (err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while selecting Grade by Idx : " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
      })
    })
  })
  .then((gradeData) => {
    // 2. DB에 정보 삽입하기
    return new Promise((resolve, reject) => {
      const user = new mongo.userModel(
        {
          id: userData.id,
          password: userData.password,
          salt: userData.salt,
          grade: gradeData._id,
          created_at: helpers.getCurrentDate()
        }
      );
  
      // 3. save로 저장
      user.save((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });
};


/*******************
 *  Login
 *  @param userData = { id, password }
 ********************/
exports.login = (userData) => {
  return new Promise((resolve, reject) => {
    mongo.userModel.login(userData, (err, result) => {
      if (err) {
        const customErr = new Error("Error occrred while Login : " + err);
        reject(customErr);        
      } else {
        resolve(result);
      }
    });
  })
  .then((result) => {
    // 인증이 완료되면 토큰을 발급해 반환해줍니다.
    return new Promise((resolve, reject) => {
      // JWT 토큰 안에 들어갈 유저의 정보입니다.
      const session = {
        idx: result.idx,
        id: result.id
      }

      const token = jwt.sign(session, process.env.JWT_CERT, {'expiresIn': "7 days"});
      const response = {
        profile: result,
        token
      };
  
      resolve(response);
    });    
  })
};            
      

/*******************
 *  getSalt: 해당 유저의 salt 값을 조회합니다.
 *  @param id: 조회하고자 하는 유저의 ID
 ********************/
exports.getSalt = (id) => {
  return new Promise((resolve, reject) => {
    mongo.userModel.selectSalt(id, (err, result) => {
      if (err) {
        const customErr = new Error("Error occrred while selecting Salt : " + err);
        reject(customErr);        
      } else {
        resolve(result);
      }
    });
  });
};


/*******************
 *  selectNoties: 해당 유저의 전체 공지 정보를 조회합니다.
 *  @param idx: 조회하고자 하는 유저의 인덱스 번호.
 ********************/
exports.selectNoties = (idx) => {
  return new Promise((resolve, reject) => {      
    mongo.userModel.selectNoties(idx, (err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while selecting User's Notifications: " + err);
          reject(customErr);        
        } else {
          const final = {
            unconfirmed: [],
            confirmed: []
          }

          result.notifications.map((noti) => {
            if (noti.confirmed) {
              final.confirmed.push(noti);
            } else {
              final.unconfirmed.push(noti);
            }
          })

          resolve(final);
        }
    });
  });
};


/*******************
 *  selectOne: 해당 유저의 상세 정보를 조회합니다.
 *  @param idx: 조회하고자 하는 유저의 인덱스 번호
 ********************/
exports.selectOne = (idx) => {
  return new Promise((resolve, reject) => {      
    mongo.userModel.selectOne(idx, (err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while selecting User: " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
    });
  });
};


/*******************
 * newNoti: 새로운 공지를 해당 유저의 notifications 배열에 추가합니다.
 * @param notiData = { notiId, gradeId }
 ********************/
exports.newNoti = (notiData) => {
  return new Promise((resolve, reject) => {      
    mongo.userModel.newNoti(notiData, (err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while selecting User: " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
    });
  });
};


/*******************
 * checkNoti: 해당 유저의 해당 공지를 확인한 것으로 처리합니다.
 * @param: data = { idx, noti }
 ********************/
exports.checkNoti = (data) => {
  return new Promise((resolve, reject) => {      
    mongo.userModel.checkNoti(data, (err, result) => {
        if (err) {
          const customErr = new Error("Error occrred while check Notification: " + err);
          reject(customErr);        
        } else {
          resolve(result);
        }
    });
  });
};