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
  /**
   * 이 부분에서 문제가 있다. 각 모델을 통해 여러 번 DB 작업이 발생하는데,
   * 이에 대한 트랜잭션 처리가 되어 있지 않다...
   * MongoDB 4.0과 Mongoose 5.2.0 버전부터는 트랜잭션 처리를 지원한다고 한다.
   * 
   * 트랜잭션은 MongoDB session에서 built된다. 
   * 1. 먼저 startSession()을 이용해 session을 시작하고,
   * 2. 이후 session의 startTransaction()을 이용해 트랜잭션을 시작한다.
   * 3. 트랜잭션을 abort하고 rollback해야 할 때는 abortTransaction()을 호출하고,
   * 4. 모든 처리가 성공적으로 완료되어 commit 할 때는 commitTransaction()을 호출한다.
   * 
   * https://mongoosejs.com/docs/transactions.html
   */

  notifications.map(async (noti) => {
    // 먼저 각 등급이 activated 된 상태인지 한 번 확인하고,
    /**
     * Grade 스키마를 생성할 때 고려한 점이,
     * MongoDB에는 다른 컬렉션에 있는 객체를 ref를 통해 조회할 때...
     * MySQL과 같이 외래 키를 걸어 제약 조건을 만들 수가 없다.
     * 
     * 기존에 있던 Grade의 값이 사라질 경우, 이를 참조하고 있는 User와 Noti 객체를 어떻게 처리할까 고민하다...
     * 일단 Grade는 한 번 생성하면 삭제할 수 없고, activated 필드를 추가해 사용 여부만 가리도록 했다.
     * 
     * 특정 Grade를 쓰게 되지 않더라도, 해당 등급으로 발송된 기존의 공지들은 영향을 받지 않는다.
     * 대신, User는 특정 Grade를 비활성 상태로 바꿀 때, 활성화된 등급 중 하나의 등급으로 수정해주는 작업이 필요할 것!
     * (공지는 **당시에** 발송된 것이기 때문에 현재 등급 상태가 중요하지 않지만, 유저에게 현재 등급 상태는 중요하다.)
     */
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
        // 자기 자신도 sub하므로 여기서는 이벤트를 emit 해주지 않습니다
        // 여기서 emit 해주면, 현재 서버에 물린 클라이언트에는 같은 이벤트가 두 번 전송되게 됩니다!
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