const validator = require('validator');

const pub = global.utils.pub;
const notiModel  = require('./../models/NotiModel');
const gradeModel = require('./../models/GradeModel');
const userModel  = require('./../models/UserModel');
const errorCode  = require('./../utils/error').code;
const socket     = require('./../utils/socket').get();

let validationError = {
  name:'ValidationError',
  errors:{}
};

/*******************
 *  save: 공지 저장하기
 *  @param: notifications: [ { target, contents } ]
 *          저장할 때, 등급 별로 공지사항의 내용을 받아옵니다.
 ********************/
exports.save = async (req, res, next) => {   
  const notifications = req.body.notifications || req.params.notifications;

  /* 유효성 체크하기 */
  let isValid = true;
  
  if (!notifications || notifications === []) {
    isValid = false;
    validationError.errors.notifications = { message : "notifications is required" };
  }

  if (!isValid) return res.status(400).json(validationError);
  /* 유효성 체크 끝 */

  // 각 공지는 등급 별로 전송하고, 저장합니다.!   
  notifications.map(async (noti) => {
    // 먼저 각 등급이 activatied 된 상태인지 한 번 확인하고,
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

        // db에 공지사항을 저장합니다.
        result = await notiModel.save(notiData);

        // 성공적으로 저장되었다면 그 공지를 받아야 하는 유저들의 noti 배열에도 추가해줍니다.
        if (result.saved) {
          const userNotiData = {
            notiId: result.object._id,
            gradeId: result.object.grade._id
          };
          result = await userModel.newNoti(userNotiData);
        }
      
        // 마지막으로, socketIO의 room을 통해 구별된 각 클라이언트들에게 push를 발송합니다.
        // 혹시 서버가 여러 대가 되었을 때를 대비해서... redis로 publish를 날려줍니다.
        socket.to(notiData.grade.name).emit('noti', notiData);
        pub.publish('socket', JSON.stringify(notiData));
      }
    } catch (err) {
      console.log(err);
      return res.status(errorCode[err].status)
                .json(errorCode[err].contents);
    }    
  });

  const respond = {
    message : "Create/Send Notifications Successfully"
  };
  return res.status(201).json(respond);
};


/*******************
 *  selectOne: 공지 하나 상세 조회하기
 *  @param idx: 조회하고자 하는 공지의 인덱스 번호
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
    result = await notiModel.selectOne(idx);
  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }

  const respond = {
    message : "Select Notification Successfully",
    result
  };
  return res.status(200).json(respond);  
};


/*******************
 *  selectAll: 공지 전체 조회하기
 ********************/
exports.selectAll = async (req, res, next) => {
  let result = '';

  try {
    result = await notiModel.selectAll();
  } catch (err) {
    console.log(err);
    return res.status(errorCode[err].status)
              .json(errorCode[err].contents);
  }

  /* 조회 성공 시 */
  const respond = {
    message : "Select Noties All Successfully",
    result
  };
  return res.status(200).json(respond);  
};