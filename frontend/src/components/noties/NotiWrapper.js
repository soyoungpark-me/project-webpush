import React, { Component } from 'react';
import { connect } from 'react-redux';

import NotiList from './NotiList';

import styles from './styles.css';

function mapStateToProps(state) {
  return {
    noties: state.user.noties
  };
}

class NotiWrapper extends Component {
  render() {
    return (
      <div className="h100 contents-wrapper">
        <NotiList type="unconfirmed" noties={this.props.noties.unconfirmed} />
        <NotiList type="confirmed"   noties={this.props.noties.confirmed} />
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(NotiWrapper);