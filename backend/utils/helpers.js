/******************************************************************************
' 파일     : helpers.js
' 작성     : 박소영
' 목적     : 서버 내에서 두루 쓰이는 helper 함수들의 모음입니다.
******************************************************************************/
const crypto = require('crypto');

/*************
 * Crypto
 *************/
exports.doCypher = (inputpass, salt) => {
  const ranString = randomString();
  const newSalt = typeof salt !== 'undefined' ? salt: ranString;

  const iterations = 100;
  const keylen = 24;

  const derivedKey = crypto.pbkdf2Sync(inputpass, newSalt, iterations, keylen, 'sha512');
  const password = Buffer(derivedKey, 'binary').toString('hex');

  const result = { password, newSalt };
  return result;
};


exports.getClientId = (customId) => {
  let result = -1;

  for(let i=0; i<clients.length; i++) {
    if(clients[i].customId === customId) {
      result = clients[i].clientId;
      break;
    }
  }

  return result;
}

exports.getCurrentDate = () => {
  var date = new Date();
 
  var year = date.getFullYear();
  var month = date.getMonth();
  var today = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();
 
  return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
}


/*******
 * 난수 생성 함수
 * @returns {string}
 */
const randomString = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  const stringLength = 8;
  let randomString = '';
  for (let i=0; i<stringLength; i++) {
    let rnum = Math.floor(Math.random() * chars.length);
    randomString += chars.substring(rnum,rnum+1);
  }
  return randomString;
};