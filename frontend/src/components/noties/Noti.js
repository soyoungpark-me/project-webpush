import React, { Component, PropTypes } from 'react';
import Moment from 'react-moment';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
// import { checkNoti } from 'actions/users/NotiActions';

import styles from './styles.css';

const icon = (type) => {
  if (type === 'friend') {
    return (<span className="ion-person-add noti-list-icon" />)
  }
}

class Noti extends Component {
  constructor(){
    super();

    this.onCheckNoti = this.onCheckNoti.bind(this);
  }

  onCheckNoti() {
    // if (this.props.checkNoti(this.props.noti.idx)) {
    //   this.context.router.history.push(this.props.noti.url);
    // }
  }

  render(){
    console.log(this.props.noti);
    return(
      <div onClick={this.onCheckNoti} 
        className={`noti-wrapper ${(this.props.noti.confirmed === true) ? '' : 'noti-unchecked'}`}>        
        <p className="noti-contents">{this.props.noti._id.contents}</p>
        <Moment className="noti-list-date" fromNow locale="ko">
          {this.props.noti._id.created_at}
        </Moment>
      </div>
    )
  }
}

export default connect(null, { /*checkNoti*/ })(Noti);