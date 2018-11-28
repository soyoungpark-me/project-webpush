import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import image from './../../../public/images/hackday.png';

class FormWrapper extends Component {
  render() {
    return (
      <div className="h100 from-root">
        <img src={image} className="hackday-image"/>

        <BrowserRouter>
           <div className="form-wrapper">
             <Route exact path="/signup" component={RegisterForm} />
             <Route exact path="/" component={LoginForm} />
           </div>
         </BrowserRouter>
      </div>
    );
  }

}

export default FormWrapper;