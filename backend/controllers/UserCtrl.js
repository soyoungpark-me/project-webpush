const validator = require('validator');

const userModel = require('../models/UserModel');
const helpers = require('../utils/helpers');
const errorCode = require('../utils/error').code;

let validationError = {
  name:'ValidationError',
  errors:{}
};


/*******************
 *  Register
 *  @param: id, password, confirm_password
 ********************/
exports.register = async (req, res, next) => {   
  /* PARAM */
  const id = req.body.id || req.params.id;
  const password = req.body.password || req.params.password;
  const confirm_password = req.body.confirm_password || req.params.confirm_password;  

  /* 1. 유효성 체크하기 */
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

  // 2. 결과 암호화해서 DB에 저장하기
  let result = '';
  try {
    const encodedPassword = helpers.doCypher(validpassword);
    const userData = {
      id,
      password: encodedPassword.password,      
      salt: encodedPassword.newSalt
    };
    result = await userModel.register(userData);
  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }

  // 3. 등록 성공
  const respond = {
    status: 201,
    message : "Register Successfully",
    result: result[0]
  };
  return res.status(201).json(respond);
};


/*******************
 *  Login
 *  @param: id, password
 ********************/
exports.login = async (req, res, next) => {
  /* PARAM */
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
    // TODO 회원이 없을 경우
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

  /* 로그인 성공 시 */
  const respond = {
    status: 200,
    message : "Login Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 *  selectOne
 *  @param: idx
 ********************/
exports.selectOne = async (req, res, next) => {
  /* PARAM */
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

  /* 조회 성공 시 */
  const respond = {
    status: 200,
    message : "Select User Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 * selectNoties: 해당 유저의 전체 공지 정보 조회
 ********************/
exports.selectNoties = async (req, res, next) => {
  /* PARAM */
  const idx = req.userData.idx;
  console.log(idx);

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

  /* 조회 성공 시 */
  const respond = {
    status: 200,
    message : "Select User's Notification Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 * checkNoti: 해당 유저의 해당 공지 확인 처리
 * @param: idx (유저 인덱스), noti (공지 ObjectId)
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

  /* 조회 성공 시 */
  const respond = {
    status: 201,
    message : "Check User's Notification Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 *  Update
 *  @param: idx, password, new_password, 
 *    confirm_password, nickname, avatar, description
 *  TODO 이미지 등록
 ********************/
exports.update = async (req, res, next) => {
  /* PARAM */
  const idx = req.userData.idx;
  const password = req.body.password || req.params.password || null;
  const newPassword = req.body.new_password || req.params.new_password || null;
  const confirmPassword = req.body.confirm_password || req.params.confirm_password || null;
  const nickname = req.body.nickname || req.params.nickname || null;
  const avatar = req.body.avatar || req.params.avatar || null;
  const description = req.body.description || req.params.description || null;

  /* 비밀번호까지 바꿀건지 */
  let changePassword = false;
  /* 유효성 체크하기 */
  let isValid = true;

  if (newPassword && !validator.isEmpty(newPassword)) { // 새 비밀번호가 존재한다면
    changePassword = true;

    // 1. 새 비밀번호와 확인 비밀번호가 일치하는지 체크
    if (!confirmPassword || !validator.equals(newPassword, confirmPassword)) {
      isValid = false;
      validationError.errors.password = { message : 'Passwords do not match' };    
    }

    // 2. 현재 비밀번호와 입력한 비밀번호가 같은지 체크
    const userData = {
      id: req.userData.id,
      password
    }
    
    if (isValid) {
      if (!password || validator.isEmpty(password)) {
        isValid = false;
        validationError.errors.idx = { message : 'Please enter the original password' };
      }
      if (isValid && await userModel.passwordCheck(userData) !== true) {
        isValid = false;
        validationError.errors.idx = { message : 'Wrong Password' };
      }
    }    
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */

  let encodedPassword;
  // 새 비밀번호 해싱
  if (changePassword) {
    encodedPassword = helpers.doCypher(newPassword);
  }

  const updateData = {
    idx, nickname, avatar, description, encodedPassword
  }
  let result = '';

  try {
    result = await userModel.update(updateData, changePassword);
  } catch (err) {
    console.log(err);
    return next(err);
    // return res.json(errorCode[err]);
  }

  /* 수정 성공 시 */
  const respond = {
    status: 201,
    message : "Update User Successfully",
    result
  };
  return res.status(201).json(respond);  
};