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
          // this.makePushNoti(data);
          toast(<Toast contents={data.contents} />, {
            position: "top-right", autoClose: 2000, pauseOnHover: true,
            hideProgressBar: true, closeOnClick: true, draggable: false
          });
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
    // ignore가 설정되어 있을 경우 푸시 공지를 생성하지 않습니다.
    if (this.state.ignore) return;
    
    const title = "공지가 도착했습니다!";
    const body = data.contents;
    const tag = Date.now(); // 태그 값이 서로 달라야 중복으로 알림이 생깁니다.
    const icon = logoPng;
    // const icon = 'http://localhost:3000/Notifications_button_24.png';

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