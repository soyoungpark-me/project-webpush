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
        if (result.length > 0) {
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
  // 1. 아이디 체크
  return new Promise((resolve, reject) => {
    const sql = `SELECT id
                   FROM users
                  WHERE id = ?`;
    
    mysql.query(sql, [userData.id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length === 0) { // 해당 아이디 없음
          reject(23400);
        } else {
          resolve(null);
        }
      }
    });
  })
  .then(() => {
    // 2. 비밀번호 체크
    return new Promise((resolve, reject) => {
      const sql = `SELECT idx, id, nickname, avatar, description, radius, anonymity, searchable
                     FROM users
                    WHERE id = ? AND password = ?`;

      mysql.query(sql, [userData.id, userData.password], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          if (rows.length === 0) { // 비밀번호가 틀렸을 경우
            reject(24400);
          } else {
            const session = {
              idx: rows[0].idx,
              id: rows[0].id,
              nickname: rows[0].nickname,
              avatar: rows[0].avatar
            };

            const profile = {
              idx: rows[0].idx,
              id: rows[0].id,
              nickname: rows[0].nickname,
              avatar: rows[0].avatar,
              description: rows[0].description,
              radius: rows[0].radius,
              anonymity: rows[0].anonymity,
              searchable: rows[0].searchable
            }

            const result = { session, profile }

            resolve(result);
          }
        }
      });
    });
  })
  .then((result) => {
    // 3. 토큰 발급 및 저장
    return new Promise((resolve, reject) => {
      const token = {
        accessToken: jwt.sign(result.session, process.env.JWT_CERT, {'expiresIn': "12h"}),
        refreshToken: jwt.sign(result.session, process.env.JWT_CERT, {'expiresIn': "7 days"})
      };

      // 7일 후 날짜 구하기
      const expiresIn = helpers.getAfterDate(); // 7일 후 삭제될 날짜
      redis.hmset('refreshTokens', token.refreshToken, 
        JSON.stringify({ idx: result.session.idx, id: result.session.id, expiresIn })); // 저장
      redis.hgetall('refreshTokens', (err, object) => {
        if (err){
          reject(26500);
        } else { // refresh 토큰까지 완벽하게 저장된 경우
          const response = {
            profile: result.profile,
            token
          };
      
          resolve(response);
        }
      });
    });    
  })
};            
        


/****************
 *  salt 조회
 *  @param: userData = { id }
 *  @returns {Promise<any>}
 */
exports.getSalt = (userData) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT salt 
                   FROM users 
                  WHERE id = ?`;

    mysql.query(sql, [userData], (err, rows) => {
      if (err){
        reject(err);
      } else {
        if (rows.length === 0) { // 해당 아이디 없음
          reject(23400);
        } else {
          resolve(rows[0]);
        }
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