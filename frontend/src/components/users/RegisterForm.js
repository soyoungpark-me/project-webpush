import React, { Component } from 'react';
import axios from 'axios';
import { Button, Form, FormGroup, Label, FormText } from 'reactstrap';
import { Field, reduxForm } from 'redux-form'
import { BrowserRouter } from 'react-router-dom';

import config from './../../config';
import styles from './styles.css';

// validation용 필드
const renderField = ({ input, label, placeholder, type }) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} className={`field-${label} form-control`} placeholder={placeholder} type={type} />
    </div>
  </div>
);

class RegisterForm extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      navigate: false,
      isValid: true
    }
  }


  async onSubmit(props){
    // 초기화
    this.state.isValid = true;

    ['ID', 'Email', 'Password', 'Confirm_password'].forEach((field) => {
      window.$('.field-'+field).css("border", "");
      window.$('.tag-'+field).hide();

      if (!props[field.toLowerCase()]) {
        window.$('.field-'+field).css("border", "red solid 1px");
        window.$('.tag-'+field).show();

        this.state.isValid = false;
      }
    });

    if (props.password && props.password.length < 8) {
      window.$('.field-Password').css("border", "red solid 1px");
      window.$('.tag-Password').text('비밀번호는 8자 이상입니다.');
      window.$('.tag-Password').show();

      this.state.isValid = false;

    }

    if (props.password && props.confirm_password && props.password !== props.confirm_password) {
      window.$('.field-Confirm_password').css("border", "red solid 1px");
      window.$('.tag-Confirm_password').text('비밀번호가 서로 일치하지 않습니다.');
      window.$('.tag-Confirm_password').show();

      this.state.isValid = false;
    }

    if (this.state.isValid) {
      const API_URL = `${config.SERVER_HOST}:${config.SERVER_PORT}/api/users/register`;

      axios.post(API_URL, props, {})
        .then(response => {
          alert('회원가입이 완료되었습니다!');
        	this.props.history.push('/login');
        })
        .catch(error => {
          if (error.response.data.code === 21400) {
            window.$('.field-ID').css("border", "red solid 1px");
            window.$('.tag-ID').text('이미 존재하는 ID입니다.');
            window.$('.tag-ID').show();
          } else if (error.response.data.code === 22400) {
            window.$('.field-Email').css("border", "red solid 1px");
            window.$('.tag-Email').text('이미 존재하는 이메일입니다.');
            window.$('.tag-Email').show();
          }
        });
    }
  }

  render() {
    const { handleSubmit, submitting } = this.props;

    if (this.state.navigate) {
      return (
        <BrowserRouter>
          {this.props.history.push('/login')}
        </BrowserRouter>
      )
    }

    return (
      <Form className='form' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <h1 className='form-title'>웹 푸시를 테스트합니다</h1>
        <hr />
        <div className='form-tab'>
          <FormGroup>
            <Field component={renderField} name="id" type="text"
              label="ID" placeholder="아이디를 입력해주세요." />
            <p className="form-error-tag tag-ID">아이디를 입력해주세요.</p>
          </FormGroup>          
          <FormGroup>
            <Field component={renderField} name="password" type="password"
              label="Password" placeholder="비밀번호를 입력해주세요." />
            <p className="form-error-tag tag-Password">비밀번호를 입력해주세요.</p>
          </FormGroup>
          <FormGroup>
            <Field component={renderField} name="confirm_password" type="password"
              label="Confirm_password" placeholder="비밀번호를 확인해주세요." />
            <p className="form-error-tag tag-Confirm_password">비밀번호 확인를 입력해주세요.</p>
          </FormGroup>
        </div>        
        <Button type='submit' disabled={submitting} className='form-button'>SIGN UP</Button>
      </Form>
    );
  };
};

export default reduxForm({
  form: 'register'
})(RegisterForm);