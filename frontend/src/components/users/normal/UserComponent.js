import React, { Component } from 'react';
import Notification from 'react-web-notification';
import { UncontrolledAlert } from 'reactstrap';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

import { connect } from 'react-redux';

import { handlePermissionGranted, setSocketConnected, 
  handlePermissionDenied, handleNotSupported } from './../../../actions/AppAction';
import { fetchNoties } from './../../../actions/UserAction';

import soundMp3 from './../../../../public/sounds/sound.mp3';
import soundOgg from './../../../../public/sounds/sound.ogg';
import logoPng from './../../../../public/images/naver.png';

import NotiWrapper from './../../noties/NotiWrapper';

import styles from './../styles.css';

/**
 * 이 컴포넌트에도 문제가 많다.
 * 일단, 개인적으로 소켓 연결을 모든 클라이언트에서 할 필요는 없다고 생각했다.
 * 먼저 로그인을 통해 인증이 된 사용자여야 하고, 관리자 계정이 아닐 경우에만 소켓 연결을 하면 된다.
 * (소켓을 연결한 상태로 유지하는 것 자체가 서버에는 부하가 되고, 소켓에 개수에도 한계가 있다.)
 * 
 * 이를 위해 로그인 된 상태면서 일반 유저에게 보이는 UserComponent가 Mount될 때 소켓을 연결해줘야겠다고 생각했다.
 * 그리고, 추후 다른 컴포넌트에서도 이 때 연결된 소켓을 재사용할 수도 있기 때문에,
 * 이 컴포넌트 안에서 소켓을 연결하고 UnMount될 때 해제하는 것은 문제가 있다고 생각했다.
 * 소켓이 필요한 객체마다 소켓을 연결하고 해제하는 것은... 서버한테 너무... 
 * 소켓은 한 번 연결해두면 현재 사용자의 세션이 끊겨 더 이상 사용하지 않을 때까지 하나로 쓰고 싶었다.
 * 
 * 그래서 결론적으로, redux의 state에 연결한 소켓을 저장하기로 했다.
 * 소켓을 연결하는 action을 만들어서 UserComponent에서 그 함수를 호출한다.
 * 
 * 근데 발생한 문제가, 소켓의 이벤트 구독을 설정하는 부분이었다.
 * store와 noti 이벤트에서는 둘 다 현재 redux의 state에 접근해야 했다.
 * 당시에 action 내에서 redux에 store에 접근하는 방법이 있다는 것을 몰라서, 어쩔 수 없이 컴포넌트에서 이 작업을 해줘야 했고,
 * ComponentWillMount에서 이 작업을 해주게 되면 당연히 소켓 객체가 없이 때문에 불가능했다.
 * 소켓 객체가 등록된 이후에 호출되는 ComponentDidUpdate에서 해줘야 했다...
 * ComponentDidUpdate가 여러 번 호출되면서 이벤트 구독을 중복으로 하는 것을 막아주기 위해,
 * 변수를 하나 만들어서 중복으로 해당 코드가 실행되는 것은 막아주었으나,
 * 
 * 가장 좋은 방법은 ComponentWillMount에서 한 번만 호출되는 setSocketConnected 함수에서 이벤트 구독까지 마쳐주는 것!
 * 1. store.getState()를 통해 액션에서도 store에 접근할 수는 있다고 한다.
 * 2. Redux-Thunk를 사용하는게 가장 좋다고는 하는데, Redux-Thunk를 잘 모르므로...
 */

const Toast = (props) => {
  return (
    <div>
      <img className="push-image" width={48} src={logoPng} />
      <span className="push-contents">{props.contents}</span>
    </div>

  );
}

function mapStateToProps(state) {
  return {
    ignore: state.app.ignore,
    socket: state.app.socket,
    profile: state.user.profile,
    noties: state.user.noties
  };
}

class UserComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      newNoti: []
    };

    this.isSessionStored = false;
    this.eventListening = false;

    this.makePushNoti = this.makePushNoti.bind(this);
    this.handleNotiOnShow = this.handleNotiOnShow.bind(this);
  }

  componentWillMount() {
    // 소켓이 설정되지 않은 상태일 경우 연결합니다.
    if (!this.props.socket || this.props.socket === null) {
      this.props.setSocketConnected();
    }
    if (typeof Notification !== 'undefined') {
      window.Notification.requestPermission((result) => {
        if (result === 'denied') {
          return;
        }
      });
    }
  };

  componentDidUpdate() {
    // 소켓 설정하기 (로그인 된 상태에서 연결을 시도하기 위해 MainComponent에서 하도록 했습니다.)
    // 1. 현재 정보을 세팅합니다.
    const socket = this.props.socket;

    if (socket && this.props.profile) {
      const profile = this.props.profile;

      let info = {
        idx       : profile.idx,                  // 현재 유저의 인덱스 값
        id       : profile.id,                    // 현재 유저의 아이디
        grade     : profile.grade.name            // 현재 유저의 등급
      };
      
      // 2. 연결하면서 현재 정보를 서버에 전송해 저장되도록 합니다.
      if (!this.isSessionStored) {
        socket.emit('store', info);
        this.isSessionStored = true;
      };

      // 푸시 이벤트를 받았을 경우, 푸시 메시지를 생성합니다.
      if (!this.eventListening) {
        socket.on('noti', (data) => {          
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
          
          this.props.fetchNoties();
          this.setState({
            newNoti: this.state.newNoti.concat([data])
          });
        });
        this.eventListening = true;
      }
    }
  };

  makePushNoti(data) {    
    const title = "공지가 도착했습니다!";
    const body = data.contents;
    const tag = Date.now(); // 태그 값이 서로 달라야 중복으로 알림이 생깁니다.
    const icon = logoPng;

    const options = {
      tag: tag,
      body: body,
      icon: icon,
      lang: 'en',
      dir: 'ltr',
      sound: soundMp3 
    }
    this.setState({
      title: title,
      options: options
    });
  };

  handleNotiOnShow(e, tag){
    document.getElementById('sound').play();
  };

  renderNewNoties() {
    return this.state.newNoti
      .map((noti, i) => {
        return (
          <UncontrolledAlert color="danger" key={i}>
            <strong>[새 공지 도착]</strong> {noti.contents}
          </UncontrolledAlert>
        );
      });
  }

  render() {
    return (
      <div className="h100 contents-wrapper">
        <h1 className='noti-list-title'>웹 푸시를 확인합니다!</h1>
        <hr />
        <div className="noti-new-list">        
          {(this.state.newNoti.length > 0) ? this.renderNewNoties() : null}
        </div>
        
        <NotiWrapper/>         
        <Notification
          ignore={this.state.ignore && this.state.title !== ''}
          notSupported={this.props.handleNotSupported}
          onPermissionGranted={this.props.handlePermissionGranted}
          onPermissionDenied={this.props.handlePermissionDenied}
          onShow={this.handleNotiOnShow}
          timeout={5000}
          title={this.state.title}
          options={this.state.options}
          />
          <audio id='sound' preload='auto'>
            <source src={soundMp3} type='audio/mpeg' />
            <source src={soundOgg} type='audio/ogg' />
            <embed hidden={true} autostart='false' loop={false} src={soundMp3} />
          </audio>
      </div>
    );
  }
}

export default connect(mapStateToProps,
  { fetchNoties, setSocketConnected, handlePermissionGranted, 
    handlePermissionDenied, handleNotSupported })(UserComponent);