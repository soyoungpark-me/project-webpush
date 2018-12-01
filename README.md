# 2018 Naver Campus Hackday Winter

2018 네이버 캠퍼스 핵데이 winter에 참가해 개발한 결과물입니다.

### contents

1. [개발 결과물](#1-개발-결과물)
2. [기술 스택 및 용도](#2-기술-스택-및-용도)
3. [문제 해결](#3-문제-해결)
4. [아쉬웠던 점](#4-아쉬웠던-점)

____

### 1. 개발 결과물

**로그인 화면**

![login](https://github.com/3457soso/project-webpush/blob/master/images/login.png?raw=true)

___

**admin 계정 화면**

![admin](https://github.com/3457soso/project-webpush/blob/master/images/admin.png?raw=true)

- 관리자 계정의 경우, 로그인 시 일반 사용자들에게 공지를 전송할 수 있는 화면을 볼 수 있습니다.
- 네 필드 중 최소 하나의 필드는 채워야 합니다. 채우지 못할 경우 요청을 보내지 않으며, 우측 상단에 토스트 메시지가 발생합니다.

___

**일반 계정 화면**

![users](https://github.com/3457soso/project-webpush/blob/master/images/users.png?raw=)

일반 계정으로 로그인하면, 좌측에서 아이디와 **등급** 정보를 확인할 수 있습니다.

- 읽지 않은 공지와 읽은 공지로 분류해 받은 공지들을 확인할 수 있습니다.
  - 읽지 않은 공지 중 한 item을 클릭하면, 해당 item은 읽음 처리되어 바로 읽은 공지로 이동합니다.
- 공지에도 등급이 있기 때문에, 색으로 해당 공지의 등급을 구별할 수 있도록 했습니다.

  

![noti](https://github.com/3457soso/project-webpush/blob/master/images/noti.png?raw=true)

- 새 공지가 도착하면, 우측 상단에 푸시 메시지가 발생합니다.
  - 푸시 메시지 생성에 **Web Notification**을 이용했습니다. (상단 푸시), 
  - 이를 지원하지 않거나 사용자가 권한을 허용해주지 않았을 경우에는 리액트 내에서 **토스트 메시지**를 생성합니다. (하단 푸시)
- 읽지 않은 공지 리스트에 새 공지가 자동으로 추가되고, 화면 상단에 **Alert** 또한 생성됩니다.

___

### 2. 기술 스택 및 용도

- **NodeJS** - 서버 프레임워크로 Express를 사용했습니다.
- **React** - 웹 클라이언트 프레임워크로 사용했습니다.
- **Redis** - pub/sub을 통해 서버의 scale out에 대비하도록 했습니다.
- **Socket.IO** - 클라이언트로 푸시 알림을 보내기 위한 통신 수단으로 사용했습니다.
- **MongoDB** - DB로는 MongoDB를 사용했습니다. **moongose**를 이용해 개발했고, 스키마는 다음과 같습니다.
  ![db](https://github.com/3457soso/project-webpush/blob/master/images/db.png?raw=true)

  - 사용자에게 공지 히스트리를 보여주기 위해, user가 **notifications**를 배열으로 가집니다.
  - noti에도 등급이 부여되는데, 이를 위해 해당 등급의 ObjectId를 추가했고, 해당 grade를 한 번 더 조회하는 것을 막고자 자주 쓰이는 필드인 **name** 또한 같이 가지고 있도록 했습니다.
  - 등급의 **activated** 필드는, 해당 등급이 활성화된 등급인지를 표시합니다. 등급을 삭제할 경우를 고려한 필드인데, 실제로 삭제하지 않고 플래그를 바꿔서 사용하지 않는다고 표시해주기로 했습니다.

  

___

### 3. 문제 해결

- **공지 대상 추리기**

  - 유저에게 등급이 부여되고, 해당 등급 별로 공지를 보내야 한다는 주제였기 때문에 공지를 받을 대상을 추려주는 작업이 필요했습니다.
  - 공지를 실시간으로 주고 받기 위해 **Socket.IO**를 쓰기로 했고, 공지 대상을 추리는 일은 Socket.IO의 **room** 개념을 이용하기로 했습니다.
  - 로그인 후 서버에 유저의 등급 정보를 보내면, 서버에서는 해당 등급으로 room을 만들고 연결된 소켓을 그 room에 저장합니다. 공지 생성 시 해당 등급의 room에 있는 소켓에 전송하도록 했습니다.
  

    ```javascript
    socket.on('store', (data) => {
          socket.join(data.grade);
          // console.log(io.sockets.adapter.rooms); // room안에 있는 유저 리스트 확인하기
    });
  
    socket.on('disconnect', () => {
          socket.leave();
    }); 
    ```

  

- **리액트 생명주기**

  - socket.io의 클라이언트에서 특정 이벤트를 구독하는 부분을 **componentDidUpdate** 부분에 추가했는데, 해당 컴포넌트가 업데이트 될 때마다 이벤트 구독이 중첩되는 문제가 있었습니다.
  - 리액트의 생명주기와 관련 함수들에 대한 이해가 부족해 발생했던 문제였습니다.
  - 컴포넌트 안에 flag 값을 만들어, 이벤트 구독은 한 번만 진행하도록 해 해결했습니다.

    ```javascript 
    if (!this.eventListening) {
        socket.on('noti', (data) => {        
        ...
    }
    ```

  

- **브라우저 호환성**

  - 푸시 메시지를 만들기 위해 사용한 것이 **HTML5 Web Notification**이었는데, [caniuse](https://caniuse.com/#search=web%20notification) 에서 확인해 본 결과 IE에서는 아예 지원이 되지 않았고, 다른 브라우저들에서도 낮은 버전의 경우엔 지원을 하지 않았습니다.

  - 이를 해결하기 위해 **Notification**이 사용 가능한지와 권한을 받았는지 체크한 뒤에, 받았을 경우에는 **Notification**으로 푸시를 생성하고 그렇지 않을 경우 리액트 모듈로 토스트 알림을 생성하도록 했습니다.
  

    ```javascript
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        ignore = true;
    } else {
        ignore = false;
    }
    
    // ignore가 설정되어 있을 경우 Web Notification 공지를 생성하지 않고
    // toast를 이용해 내부 알림으로 생성합니다.
    if (this.props.ignore) {
        toast(<Toast contents={data.contents} />, {
            position: "top-right", autoClose: 2000, pauseOnHover: true,
            hideProgressBar: true, closeOnClick: true, draggable: false
        });
    } else {
    // Permission을 받았을 때는 HTML5 Web Notification을 사용해 푸시를 생성합니다.
        this.makePushNoti(data);
    }
    ```

___

### 4. 아쉬웠던 점

- **DB 스키마**
  - 주로 MySQL을 사용하다가 MongoDB를 쓰게 되었는데, 생각보다 스키마를 만드는 일이 힘들었습니다. 
  - 중복되는 데이터는 없도록 하면서 개발의 용이성도 챙기기 위해 ObjectID를 통한 참조를 사용했는데, 올바른 스키마 작성 방법인지에 대한 확신이 없어, 공부가 더 필요할 것 같다고 느꼈습니다.
  
- **브라우저 호환성**
  - 브라우저 호환성에 대한 검증이 모자랐던 것 같아 아쉬웠습니다. 개발 환경이 우분투였기 때문에 개발하는 중에는 IE로 직접 돌려보지 못했고, 마지막에 배포 후에 IE로 확인해봤을 떄는 잘 돌아가지 않았습니다.
  - 급하게 소스를 수정해 IE에서 실행조차 되지 않는 것은 해결했지만... 이상하게도 IE에서는 엄청 느리게 실행되어 결국 문제를 해결하지 못했습니다.
  
- **푸시 방법에 대해 깊게 고민하지 못한 점**
  - 실시간 서비스의 경우 당연히 웹소켓을 사용한다고 생각하고 있었는데, 이 외에도 다양한 방법들이 있으며 환경에 따라 장단점이 다르다는 걸 깊게 고민하지 않았다는 것이 아쉬웠습니다.
