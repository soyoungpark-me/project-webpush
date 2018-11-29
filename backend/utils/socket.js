/******************************************************************************
' 파일     : socket.js
' 목적     : Socket IO 이벤트들을 정리해놓은 파일입니다.
******************************************************************************/

const redis = global.utils.redis;
const pub = global.utils.pub;
const sub = global.utils.sub;

let io = null;

exports.get = () => {
  return io;
}

exports.init = (http) => {
  io = require('socket.io')(http);
  
  // 서버간 pub/sub을 위해 socket 구독
  sub.subscribe('socket');

  // data = { socketId, event, response }
  sub.on('message', (channel, data) => {
    const parsed = JSON.parse(data);

    if (channel === 'socket') {
      // 여기에 들어왔다는 것은, 메시지가 도착했는데 소켓이 그 서버에는 없었다는 뜻입니다.
      // 동시에 다른 서버에도 pub을 했을 테니까... 
      // 여기서도 똑같이 있으면 처리하고, 대신 없으면 다시 pub 해줄 필요없이 무시합니다.
      if (Object.keys(io.sockets.sockets).includes(parsed.socketId)) {
        io.sockets.to(parsed.socketId).emit(parsed.event, parsed.response);
      }      
    }
  });

  io.on('connection', (socket) => {
    /*******************
     * 소켓 에러 로그
    ********************/
    socket.on('error', (error) => {
      logger.log("error", "Error: websocket error", error);
    }).on('connect_error', (error) => {
      logger.log("error", "Error: websocket error", error);
    }).on('reconnect_error', (error) => {
      logger.log("error", "Error: websocket error", error);
    });

    /*******************
     * 소켓 연결 : 클라에서 보내온 정보에 따라 room에 들어가도록 합니다.
    ********************/
    socket.on('store', (data) => {
      socket.join(data.grade);
    });

    /*******************
     * 연결 종료 : 클라의 연결이 종료되었을 경우 room에서도 나가도록 합니다.
    ********************/
    socket.on('disconnect', () => {
      socket.leave();
    });  
  });
};