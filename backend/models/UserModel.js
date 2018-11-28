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
 *  @param: userData = { id, password }
 *  TODO refresh token
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
    // 2. 토큰 발급 및 저장
    return new Promise((resolve, reject) => {
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
        


/****************
 *  salt 조회
 *  @param: id
 *  @returns {Promise<any>}
 */
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
 * selectNoties: 해당 유저의 전체 공지 정보 조회
 * @param: idx (유저 인덱스)
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
 *  SelectOne
 *  @param: idx
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
 * newNoti: 새로운 공지 user의 배열에 추가하기
 * @param: notiData = { notiId, gradeId }
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
 * checkNoti: 해당 유저의 해당 공지 확인 처리
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


/*******************
 *  PasswordCheck
 *  @param: userData = { idx, password }
 ********************/
exports.passwordCheck = (userData) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT COUNT(*)
                   FROM users
                  WHERE id = ? AND password = ?`;

    mysql.query(sql, [userData.id, userData.password], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length === 0) { // 비밀번호가 틀렸을 경우
          reject(27400);
        } else {
          resolve(true);
        }
      }
    });
  });
};



/*******************
 *  Update
 *  @param: updateData = { idx, nickname, avatar, description, 
 *            encodedPassword = { password, newSalt }
 *          }, 
 *          changePassword
 ********************/
exports.update = (updateData, changePassword) => {
  return new Promise((resolve, reject) => {
    let sql = '';
    let params = [updateData.nickname, updateData.avatar, 
                  updateData.description, updateData.idx];

    if (changePassword) {
      sql = `UPDATE users
                SET password = ?, salt = ?, nickname = ?, 
                    avatar = ?, description = ? 
              WHERE idx = ?`
      params.unshift(updateData.encodedPassword.newSalt)
      params.unshift(updateData.encodedPassword.password);
    } else {
      sql = `UPDATE users
                SET nickname = ?, avatar = ?, description = ? 
              WHERE idx = ?`
    }    

    mysql.query(sql, params, 
        (err, rows) => {
          if (err) {
            reject(err);
          } else {;
            resolve(rows);
          }
    });
  });
}