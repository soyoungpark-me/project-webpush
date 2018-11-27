const validator = require('validator');

const gradeModel = require('../models/GradeModel');
const helpers = require('../utils/helpers');
const errorCode = require('../utils/error').code;

let validationError = {
  name:'ValidationError',
  errors:{}
};


/*******************
 *  save
 *  @param: name, condition
 ********************/
exports.save = async (req, res, next) => {   
  /* PARAM */
  const name = req.body.name || req.params.name;
  const condition = req.body.condition || req.params.condition;

  /* 1. 유효성 체크하기 */
  let validpassword;
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

  // 2. DB에 저장하기
  try {
    const gradeData = {
      name, condition
    };
    result = await gradeModel.save(gradeData);
  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }

  // 3. 등록 성공
  const respond = {
    status: 201,
    message : "Create Grade Successfully",
    result: result[0]
  };
  return res.status(201).json(respond);
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
    result = await gradeModel.selectOne(idx);
  } catch (err) {
    console.log(err);
    return res.json(errorCode[err]);
  }

  /* 조회 성공 시 */
  const respond = {
    status: 200,
    message : "Select Grade Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 *  SelectAll
 ********************/
exports.selectAll = async (req, res, next) => {
  let result = '';

  try {
    result = await gradeModel.selectAll();
  } catch (err) {
    console.log(err);
    return res.json(errorCode[err]);
  }

  /* 조회 성공 시 */
  const respond = {
    status: 200,
    message : "Select Grade All Successfully",
    result
  };
  return res.status(200).json(respond);  
};