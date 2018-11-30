const validator = require('validator');

const gradeModel = require('../models/GradeModel');
const errorCode = require('../utils/error').code;

let validationError = {
  name:'ValidationError',
  errors:{}
};


/*******************
 *  save: 새로운 등급을 저장합니다.
 *  @param name: 등급의 이름
 *  @param condition: 해당 등급을 만족하기 위한 조건
 ********************/
exports.save = async (req, res, next) => {   
  const name = req.body.name || req.params.name;
  const condition = req.body.condition || req.params.condition;

  /* 유효성 체크하기 */
  let isValid = true;
  
  if (!name || validator.isEmpty(name)) {
    isValid = false;
    validationError.errors.name = { message : "name is required" };
  }

  if (!condition || validator.isEmpty(condition)) {
    isValid = false;
    validationError.errors.condition = { message : "condition is required" };
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */
  
  try {
    const gradeData = { name, condition };
    result = await gradeModel.save(gradeData);
  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }
  
  const respond = {
    message : "Create Grade Successfully",
    result: result
  };
  return res.status(201).json(respond);
};


/*******************
 *  selectOne: 해당 등급을 상세하게 조회합니다.
 *  @param idx: 조회하고자 하는 등급의 인덱스 번호
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
    result = await gradeModel.selectOne(idx);
  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }

  /* 조회 성공 시 */
  const respond = {
    message : "Select Grade Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 *  selectAll: 등록된 모든 등급을 조회합니다.
 ********************/
exports.selectAll = async (req, res, next) => {
  let result = '';

  try {
    result = await gradeModel.selectAll();
  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }

  const respond = {
    message : "Select Grade All Successfully",
    result
  };
  return res.status(200).json(respond);  
};