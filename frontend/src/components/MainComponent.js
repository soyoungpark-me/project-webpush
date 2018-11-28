import React, { Component } from 'react';
import Notification from 'react-web-notification';
import 'react-toastify/dist/ReactToastify.css';
import { Router, Switch, Route, withRouter } from 'react-router-dom';
import Loader from 'react-loader-spinner';
import history from './../history';

import { connect } from 'react-redux';

import { handlePermissionGranted, setSocketConnected, 
  handlePermissionDenied, handleNotSupported } from './../actions/AppAction';
import { getProfile } from './../actions/UserAction';

import soundMp3 from './../../public/sounds/sound.mp3';
import soundOgg from './../../public/sounds/sound.ogg';
import speakerPng from './../../public/images/speaker.png';
import config from './../config';

function mapStateToProps(state) {
  return {
    ignore: state.app.ignore,
    socket: state.app.socket,
    profile: state.user.profile
  };
}

class MainComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: ''
    };

    this.isSessionStored = false;

    this.makePushNoti = this.makePushNoti.bind(this);
    this.handleNotiOnShow = this.handleNotiOnShow.bind(this);
  }

  componentDidMount() {
    // 소켓이 설정되지 않은 상태일 경우 연결합니다.
    if (!this.props.socket || this.props.socket === null) {
      this.props.setSocketConnected();
    }

    if (!this.props.profile) {
      this.props.getProfile(sessionStorage.getItem("idx"));
    }
  };

  componentDidUpdate() {
    if (!sessionStorage.getItem("token")) {
      return;
    }

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
      socket.on("speaker", (data) => {
        this.makePushNoti(data);
      });
    }
  };

  makePushNoti(data) {
    // ignore가 설정되어 있을 경우 푸시 공지를 생성하지 않습니다.
    if (this.state.ignore) return;
    
    const title = "공지가 도착했습니다!";
    const body = data.contents;
    const tag = Date.now(); // 태그 값이 서로 달라야 중복으로 알림이 생깁니다.
    const icon = speakerPng;
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

  render() {
    return (
      <div>

      </div>
    );
  }
}

export default connect(mapStateToProps,
  { getProfile, setSocketConnected, handlePermissionGranted, 
    handlePermissionDenied, handleNotSupported })(MainComponent);