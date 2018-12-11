/******************************************************************************
' 파일     : global.js
' 목적     : DB나 메시지 큐, logger 등 전역으로 쓰이는 모듈을 모아놓은 파일입니다.
******************************************************************************/

/**
 * DB같은 경우는, 커넥션을 한 번 만들어 놓고 필요할 때 가져다 쓰면 된다...
 * 각 모델에서 DB 커넥션 객체를 그때그때 만드는 것은 비효율적이지 않을까!
 * DB 커넥션을 만들고 이를 해제하고.. 이런 과정이 다 서버와 D의 리소스를 사용하는 것이니까!
 * 
 * 때문에 프로세스가 올라갈 때 먼저 DB 커넥션을 모두 생성해 놓고,
 * 이를 전역 객체로 만들어 필요할 때 가져다 쓸 수 있도록 하고 싶었는데
 * 사실 이 방법이 맞는지는 잘 모르겠다!
 */
const config = require('../utils/config');

/* redis */
const pub = require('redis').createClient(process.env.REDIS_PORT, process.env.EC2_HOST);  
      pub.auth(process.env.REDIS_PASSWORD);
const sub = require('redis').createClient(process.env.REDIS_PORT, process.env.EC2_HOST);
      sub.auth(process.env.REDIS_PASSWORD);

/* mongodb */
const mongoose = require('mongoose');

const url = `mongodb://${process.env.EC2_HOST}:${process.env.MONGO_PORT}/${process.env.DB_NAME}`;

const options = {
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
  autoReconnect: true,
  useNewUrlParser: true,
  poolSize: 2,
  keepAlive: 300000,
  connectTimeoutMS: 30000,
  reconnectTries: 300000,
  reconnectInterval: 2000,
  promiseLibrary: global.Promise
};

mongoose.connect(url, options);

const mongo = {};
mongo.db = mongoose.connection;
mongo.db.on('error', console.error);
mongo.db.once('open', function(){
  console.log("[MongoDB] *** New connection established with the MongoDB ...");
  createSchema(config); // utils/config에 등록된 스키마 및 모델 객체 생성
});
mongo.db.on('disconnected', function(){
  console.log("[MongoDB] Connection disconnected with the MongoDB ...");
});

// config에 정의한 스키마 및 모델 객체 생성
function createSchema(config){
  const schemaLen = config.db_schemas.length;

  for (let i = 0; i < schemaLen; i++){
    let curItem = config.db_schemas[i];

    // 모듈 파일에서 모듈을 불러온 후 createSchema() 함수 호출!
    let curSchema = require(curItem.file).createSchema(mongoose);

    // User 모델 정의
    let curModel = mongoose.model(curItem.collection, curSchema);

    // database 객체에 속성으로 추가
    mongo[curItem.schemaName] = curSchema;
    mongo[curItem.modelName] = curModel;
    console.log("[MongoDB] { %s, %s } is added to mongo Object.",
      curItem.schemaName, curItem.modelName);
  }
};

module.exports.pub = pub;
module.exports.sub = sub;
module.exports.mongo = mongo;