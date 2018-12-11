import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Loader from 'react-loader-spinner';

import { connect } from 'react-redux';

import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import NotiForm from './users/admin/NotiForm';
import UserComponent from './users/normal/UserComponent';
import ProfileComponent from './users/ProfileComponent';

import image from './../../public/images/hackday.png';

import { fetchProfile } from './../actions/UserAction';

function mapStateToProps(state) {
  return {
    profile: state.user.profile
  };
}

/**
 * 현재 sessionStorage에 token이 있는지 확인하고, token이 있으면 ...
 * - 현재 유저가 admin일 경우 NotiForm을,
 * - 현재 유저가 일반 유저일 경우에는 UserComponent를 보여준다.
 * token이 없다면 현재 path에 따라 회원가입이나 로그인 폼을 보여준다.
 */
class MainComponent extends Component {
  render() {
    let contents = null;

    if (!sessionStorage.getItem("token")) {
      contents = (
        <div className="h100">
          <img src={image} className="hackday-image" alt="hackday" />
          <BrowserRouter>
            <div className="form-wrapper">
              <Route exact path="/signup" component={RegisterForm} />
              <Route exact path="/" component={LoginForm} />
            </div>           
          </BrowserRouter>
        </div>
      );
    } else {
      if (this.props.profile) {
        contents = (
          <div className="h100">
            <ProfileComponent />
            {this.props.profile.admin ? <NotiForm /> : <UserComponent />}
          </div>
        );
      } else {
        this.props.fetchProfile();
        contents = <Loader type="Oval" color="#1FBF28" height="130" width="130" />
      }
    }
    return (
      <div className="h100 from-root">
        {contents}        
      </div>
    );
  }
}

export default connect(mapStateToProps, { fetchProfile })(MainComponent);