import React, { Component } from 'react';

import { connect } from 'react-redux';

import logoPng from './../../../public/images/naver.png';

function mapStateToProps(state) {
  return {
    profile: state.user.profile
  };
}

class ProfileComponent extends Component {
  logout() {
    // 토큰 값을 삭제해주고 화면을 갱신해줍니다.
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("idx");             
    window.location.reload();
  }

  render() {
    if (this.props.profile) {
      let grade = "";
      if (this.props.profile.admin) {
        grade = "관리자";
      } else {
        if (this.props.profile.grade)
          grade = this.props.profile.grade.name;
      }
      return (
        <div className="profile-wrapper">
          <img className="profile-logo" src={logoPng} alt="logo" />
          <p className="profile-id">{this.props.profile.id}</p>
          <p className="profile-grade">{grade}</p>
          <button onClick={this.logout} className="profile-logout">BYE!</button>
        </div>
      )
    }
  }

}

export default connect(mapStateToProps, null)(ProfileComponent);