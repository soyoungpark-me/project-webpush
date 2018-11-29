/******************************************************************************
' 파일     : config.js
' 목적     : mongoDB 스키마와 모델, 페이지네이션 단위 등 서버의 변수들을 변경할 수 있는 파일입니다.
******************************************************************************/

module.exports = {
  db_schemas : [
    {
      file: '../schemas/GradeSchema',
      collection: 'grade',
      schemaName: 'gradeSchema',
      modelName: 'gradeModel'
    },
    {
      file: '../schemas/NotiSchema',
      collection: 'noti',
      schemaName: 'notiSchema',
      modelName: 'notiModel'
    },
    {
      file: '../schemas/UserSchema',
      collection: 'user',
      schemaName: 'userSchema',
      modelName: 'userModel'
    },
    {
      file: '../schemas/SeqSchema',
      collection: 'seq',
      schemaName: 'seqSchema',
      modelName: 'seqModel'
    }
  ]
}
