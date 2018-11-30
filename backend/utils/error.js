module.exports.code =
{
  // Auth Api 관련 에러 코드
  // auth
  10400 : {
    status: 400,
    contents: {
      code: 11400,
      message: "Access or Refresh Token is required"
    }
  },
  11400 : {
    status: 400,
    contents: {
      code: 11400,
      message: "Token is expired"
    }
  },
  12400 : {
    status: 400,
    contents: {
      code: 12400,
      message: "Token is invalid"
    }
  },

  // User Api 관련 에러 코드
  // select
  20400 : {
    status: 400,
    contents: {
      code: 20400,
      message: "User with this Idx does not exist"
    }
  },

  // register
  21400 : {
    status: 400,
    contents: {
      code: 21400,
      message: "This ID already exists"
    }
  },
  22500 : {
    status: 500,
    contents: {
      code: 22500,
      message: "Error occurred while saving the user data into DB"
    }
  },

  // login
  23400 : {
    status: 400,
    contents: {
      code: 23400,
      message: "This ID does not exist"
    }
  },
  24400 : {
    status: 400,
    contents: {
      code: 24400,
      message: "Wrong Password"
    }
  },
  25400 : {
    status: 400,
    contents: {
      code: 25400,
      message: "User with this ID does not exist"
    }
  },

  // Grade Api 관련 에러 코드
  // select
  30400 : {
    status: 400,
    contents: {
      code: 30400,
      message: "Grade with this Idx does not exist"
    }
  },

  // save
  31400 : {
    status: 400,
    contents: {
      code: 30400,
      message: "This name for grade already exists"
    }
  },

  // Noti Api 관련 에러 코드
  // select
  40400 : {
    status: 400,
    contents: {
      code: 40400,
      message: "Notification with this Idx does not exist"
    }
  }
};