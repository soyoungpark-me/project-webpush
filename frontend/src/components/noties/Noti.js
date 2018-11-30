import React, { Component } from 'react';
import Moment from 'react-moment';
import 'moment/locale/ko';

import { connect } from 'react-redux';
import axios from 'axios';

import { fetchNoties } from './../../actions/UserAction';

import config from './../../config';
import styles from './styles.css';

class Noti extends Component {
  constructor(){
    super();

    this.onCheckNoti = this.onCheckNoti.bind(this);
  }

  onCheckNoti() {
    if (this.props.noti.confirmed === false) {
      const ROOT_URL = `${config.SERVER_HOST}:${config.SERVER_PORT}/api`;

      axios.put(`${ROOT_URL}/users/noties`, 
        { "noti": this.props.noti._id._id },
        { headers: { "token": sessionStorage.getItem('token') }})
      .then((response) => {
        this.props.fetchNoties();
      });
    }
  }

  render(){
    return(
      <div onClick={this.onCheckNoti} 
        className={`noti-wrapper ${(this.props.noti.confirmed === true) ? '' : 'noti-unchecked'}`}>        
        <div className="noti-color" style={{backgroundColor: config.COLOR[this.props.noti._id.grade.name]}}/>
        <p className="noti-contents">{this.props.noti._id.contents}</p>
        <Moment className="noti-list-date" fromNow locale="ko">
          {this.props.noti._id.created_at}
        </Moment>
      </div>
    )
  }
}

export default connect(null, { fetchNoties })(Noti);