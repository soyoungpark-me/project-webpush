import React, { Component } from 'react';
import { ToastContainer, Slide } from "react-toastify";
import { BrowserRouter, Route, Router, withRouter } from 'react-router-dom';
import history from './../history';

/* for Redux */
import { connect } from 'react-redux';

import LoginForm from './users/LoginForm';
import RegisterForm from './users/RegisterForm';
import MainComponent from './MainComponent';

import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

const App = withRouter(props => <MyComponent {...props}/>);

class MyComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null
    }
  }  

  render() {
    let renderLayout;

    if (sessionStorage.getItem('token')) {
      renderLayout = (
        <BrowserRouter>
          <Route exact path="/" component={MainComponent} />
        </BrowserRouter>
      );
    } else {
      renderLayout = (
        <BrowserRouter>
          <div>
            <Route exact path="/signup" component={RegisterForm} />
            <Route exact path="/login" component={LoginForm} />
            <Route exact path="/" component={LoginForm} />
          </div>
        </BrowserRouter>
      );
    }

    return (
      <Router history={history}>
        <div className="h100 contents-wrapper">
        { renderLayout }
        <ToastContainer transition={Slide} position="top-right" rtl={false}
          autoClose={2000} hideProgressBar newestOnTop closeOnClick
          pauseOnVisibilityChange draggable={false} pauseOnHover />
        </div>
      </Router>
    );
  }
}

export default App;