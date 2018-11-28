/******************************************************************************
' 파일     : session.js
' 작성     : 박소영
' 목적     : 레디스에 저장되는 세션과 관련된 함수들을 모아논 파일입니다.
******************************************************************************/

const redis = global.utils.redis;
const pub = global.utils.pub;

/**
 * storeAll: 레디스에 전달 받은 유저 정보를 저장하는 함수입니다.
 * @param socketId
 * @param data = { idx, id, grade}
 */
exports.store = (socketId, data) => {
  console.log("store) " + socketId);
  const info = {
    idx: data.idx,
    id: data.id
  };
  
  // 해당 유저의 grade를 key로 하는 hash에 유저 정보를 저장합니다.
  // redis.hmset(data.grade, socketId, JSON.stringify(info));
  redis.set(socketId, data.grade, function (err) {
    if (err) {
       console.error("[Redis] error occured while set session");
    } else {
        redis.get(socketId, function(err, value) {
             if (err) {
                 console.error("[Redis] error occured while get session");
             } else {
                 console.log("Worked: " + value);
             }
        });
    }
  });
}

/**
 * remove: socketId를 주면 해당 소켓에 물려있는 유저의 세션 정보를 삭제합니다.
 * @param socketId
 */
exports.remove = (socketId) => {
  redis.del(socketId, function (err) {
    if (err) {
       console.error("[Redis] error occured while remove session");
    }
  });
}
