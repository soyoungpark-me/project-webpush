/******************************************************************************
' 파일     : socket.js
' 목적     : Socket IO 이벤트들을 정리해놓은 파일입니다.
******************************************************************************/

const sub = global.utils.sub;

let io = null;

exports.get = () => {
  return io;
}

exports.init = (http) => {
  io = require('socket.io')(http);
  
  // 혹시 서버가 여러 대가 되었을 때를 대비해서... 
  // 서버간 이벤트를 pub/sub 하기 위해 socket 채널을 구독하도록 합니다.
  sub.subscribe('socket');

  // data = { socketId, event, response }
  sub.on('message', (channel, data) => {
    const parsed = JSON.parse(data);

    if (channel === 'socket') {
      // 새로운 noti 생성 요청이 특정 서버로 들어갔을 때, 다른 서버들로 publish를 해줍니다.
      // 이를 subscribe 하고 있던 서버들이 이벤트를 받게 되면,
      // 각자 연결되어 있는 클라이언트로 noti 생성 이벤트를 보내 푸시를 전송합니다.
      io.sockets.in(parsed.grade.name).emit('noti', parsed);
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
      // console.log(io.sockets.adapter.rooms); // room안에 있는 유저 리스트 확인하기
    });

    /*******************
     * 연결 종료 : 클라의 연결이 종료되었을 경우 room에서도 나가도록 합니다.
    ********************/
    socket.on('disconnect', () => {
      socket.leave();
    });  
  });
};