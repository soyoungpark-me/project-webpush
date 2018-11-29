import React, { Component } from 'react';
import Loader from 'react-loader-spinner';

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
    let contents = "";

    if (this.props.noties) {
      contents = (
        <div>
          <NotiList type="unconfirmed" noties={this.props.noties.unconfirmed} />
          <NotiList type="confirmed"   noties={this.props.noties.confirmed} />
        </div>
      );
    } else {
      contents = <Loader type="Oval" color="#1FBF28" height="130" width="130" />;
    }

    return (
      <div className="h100 contents-wrapper">
        {contents}
      </div>
    );
  }
}

export default connect(mapStateToProps, null)(NotiWrapper);