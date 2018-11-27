const validator = require('validator');

const notiModel = require('../models/NotiModel');
const gradeModel = require('../models/GradeModel');
const userModel = require('../models/UserModel');
const errorCode = require('../utils/error').code;

let validationError = {
  name:'ValidationError',
  errors:{}
};


/*******************
 *  save
 *  @summary: 알림을 저장하고, 접속 중인 사용자에게 push를 전송합니다.
 *  @param: notifications: [ { target, contents } ]
 *  @returns: res
 *  @todo: 가능하면 큐로 DB에 저장하고 push를 보내는 작업을 이관해보자!
 ********************/
exports.save = async (req, res, next) => {   
  /* PARAM */
  const notifications = req.body.notifications || req.params.notifications;

  /* 1. 유효성 체크하기 */
  let isValid = true;
  
  if (!notifications || notifications === []) {
    isValid = false;
    validationError.errors.notifications = { message : "notifications is required" };
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */

  // 2. 각 공지는 타겟 별로 전송하고, 저장한다! 
  
  notifications.map(async (noti) => {
    console.log(noti);
    // 먼저 각 target이 activatied 된 상태인지 한 번 확인하고,
    let result = '';
    try {
      result = await gradeModel.check(noti.target);
      if (result.activated) {
        const notiData = {
          grade: {
            _id: result._id,
            name: result.name
          },
          contents: noti.contents
        };

        // db에 공지사항을 저장한다.
        result = await notiModel.save(notiData);

        // 성공적으로 저장되었다면 유저의 noti 배열에도 추가해준다.
        if (result.saved) {
          const userNotiData = {
            notiId: result.object._id,
            gradeId: result.object.grade._id
          };
          result = await userModel.newNoti(userNotiData);
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(errorCode[err].status)
                .json(errorCode[err].contents);
    }

    // redis의 등급 이름으로 클라이언트 리스트를 가져온 뒤에,
    // 각 클라이언트들에게 push를 발송한다!
  })

  // 3. 등록 성공
  const respond = {
    status: 201,
    message : "Create/Send Notifications Successfully"
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