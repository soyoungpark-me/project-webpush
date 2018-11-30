import React, { Component } from 'react';

import Noti from './Noti';

import styles from './styles.css';

class NotiList extends Component {
  constructor(props){
    super(props);

    this.state = {
      page: this.props.page
    }

    this.onClickButton = this.onClickButton.bind(this);
  }

  onClickButton() {
    this.setState({
      page: this.state.page + 1
    })
  }

  renderNoties(){    
    if (this.props.noties.length === 0) {
      return (
        <p className="noti-info">도착한 알림이 없습니다!</p>
      )
    } else {
      return this.props.noties.reverse()
        .map((noti, i) => {
          return <Noti noti={noti} key={i} />
      });
    }
  }

  render() {    
    if (!this.props.noties) {
      return (       
        <p>알림을 로딩하고 있습니다.</p>
      )
    } else {
      return(
        <div className="noti-type-wrapper">
          <span className="noti-type">
            {(this.props.type === "confirmed") ? "읽은 공지" : "읽지 않은 공지"}</span>
          <span className={`noti-count ${this.props.type}`}>
            {this.props.noties.length}</span>
            <div className="noti-title-wrapper">        
              <p className="noti-title-contents grade">등급</p>
              <p className="noti-title-contents contents">공지 내용</p>
              <p className="noti-title-contents date">작성 시간</p>
            </div>
          {this.renderNoties()}
        </div>
      )
    }      
  }
}

export default NotiList;