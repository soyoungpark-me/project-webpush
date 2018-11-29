const validator = require('validator');

const userModel = require('../models/UserModel');
const helpers = require('../utils/helpers');
const errorCode = require('../utils/error').code;

let validationError = {
  name:'ValidationError',
  errors:{}
};


/*******************
 *  register: 유져 회원가입!
 *  @param id
 *  @param password
 *  @param confirm_password: 비밀번호의 두 필드가 일치해야 합니다!
 *  @param admin: 해당 유저가 관리자인지를 나타냅니다. (없어도 되는 필드)
 ********************/
exports.register = async (req, res, next) => {   
  const id = req.body.id || req.params.id;
  const password = req.body.password || req.params.password;
  const confirm_password = req.body.confirm_password || req.params.confirm_password;  
  const admin = req.body.admin || req.params.admin || null;

  /* 유효성 체크하기 */
  let validpassword;
  let isValid = true;
  
  if (!id || validator.isEmpty(id)) {
    isValid = false;
    validationError.errors.id = { message : "ID is required" };
  }

  if (!password || validator.isEmpty(password)) {
    isValid = false;
    validationError.errors.password = { message : "Password is required" };
  }
  
  // 입력한 비밀번호가 서로 일치하는지 체크
  if (password !== confirm_password) {
    isValid = false;
    validationError.errors.password = { message : "Passwords do not match" };
  } else {
    validpassword = password;
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */

  // 결과를 암호화해서 DB에 저장합니다.
  let result = '';
  try {
    const encodedPassword = helpers.doCypher(validpassword);
    let userData = {
      id,
      password: encodedPassword.password,      
      salt: encodedPassword.newSalt
    };

    if (admin !== null) {
      userData.admin = admin;
    }

    result = await userModel.register(userData);
  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }

  const respond = {
    status: 201,
    message : "Register Successfully",
    result: result[0]
  };
  return res.status(201).json(respond);
};


/*******************
 *  login: 유저 로그인 기능입니다.
 *  @param id
 *  @param password
 ********************/
exports.login = async (req, res, next) => {
  const id = req.body.id || req.params.id;
  const password = req.body.password || req.params.password;

  /* 유효성 체크하기 */
  let isValid = true;

  if (!id || validator.isEmpty(id)) {
    isValid = false;
    validationError.errors.id = { message : 'ID is required' };
  }

  if (!password || validator.isEmpty(password)) {
    isValid = false;
    validationError.errors.password = { message:'Password is required' };
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */

  let result = '';

  try {
    let getSalt;
    try {
      getSalt = await userModel.getSalt(id);
    } catch (err) {
      console.log(err);
      return res.status(errorCode[err].status)
                .json(errorCode[err].contents);
    }    

    const decodedPassword = helpers.doCypher(password, getSalt.salt).password;
    const userData = {
      id: id,
      password: decodedPassword
    };

    result = await userModel.login(userData);

  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }

  const respond = {
    status: 200,
    message : "Login Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 *  selectOne: 해당 유저의 상세 정보를 조회합니다.
 *  @param idx: 조회하고자 하는 유저의 인덱스 번호
 ********************/
exports.selectOne = async (req, res, next) => {
  const idx = req.body.idx || req.params.idx;

  /* 유효성 체크하기 */
  let isValid = true;

  if (!idx || idx === null) {
    isValid = false;
    validationError.errors.idx = { message : 'Idx is required' };
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */

  let result = '';

  try {
    result = await userModel.selectOne(idx);
  } catch (err) {
    console.log(err);
    return res.json(errorCode[err]);
  }

  const respond = {
    status: 200,
    message : "Select User Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 * selectNoties: 해당 유저의 전체 공지 정보를 조회합니다.
 ********************/
exports.selectNoties = async (req, res, next) => {
  const idx = req.userData.idx;

  /* 유효성 체크하기 */
  let isValid = true;

  if (!idx || idx === null) {
    isValid = false;
    validationError.errors.idx = { message : 'Idx is required' };
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */

  let result = '';

  try {
    result = await userModel.selectNoties(idx);
  } catch (err) {
    console.log(err);
    return res.json(errorCode[err]);
  }

  const respond = {
    status: 200,
    message : "Select User's Notification Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 *  checkNoti: 해당 유저의 해당 공지를 확인한 것으로 처리합니다.
 *  @param noti: 확인한 것으로 처리할 공지의 오브젝트 ID입니다.
 ********************/
exports.checkNoti = async (req, res, next) => {
  /* PARAM */
  const idx = req.userData.idx;
  const noti = req.body.noti || req.params.noti;

  /* 유효성 체크하기 */
  let isValid = true;

  if (!idx || idx === null) {
    isValid = false;
    validationError.errors.idx = { message : 'Idx is required' };
  }

  if (!noti || validator.isEmpty(noti)) {
    isValid = false;
    validationError.errors.noti = { message : 'Notification\'s Object ID is required' };
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */

  let result = '';

  try {
    const data = {
      idx, noti
    };

    result = await userModel.checkNoti(data);
  } catch (err) {
    console.log(err);
    return res.json(errorCode[err]);
  }
  
  const respond = {
    status: 201,
    message : "Check User's Notification Successfully",
    result
  };
  return res.status(200).json(respond);  
};