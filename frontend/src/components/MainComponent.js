import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Loader from 'react-loader-spinner';

import { connect } from 'react-redux';

import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import NotiForm from './admin/NotiForm';

import image from './../../public/images/hackday.png';
import UserComponent from './users/UserComponent';

import { fetchProfile } from './../actions/UserAction';

function mapStateToProps(state) {
  return {
    profile: state.user.profile
  };
}

class MainComponent extends Component {
  render() {
    let contents = null;

    if (!sessionStorage.getItem("token")) {
      contents = (
        <div className="h100">
          <img src={image} className="hackday-image"/>
          <BrowserRouter>
            <div className="form-wrapper">
              <Route exact path="/signup" component={RegisterForm} />
              <Route exact path="/" component={LoginForm} />
            </div>           
          </BrowserRouter>
        </div>
      );
    } else {
      console.log(this.props.profile);
      if (this.props.profile) {
        contents = this.props.profile.admin ? <NotiForm /> : <UserComponent />
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