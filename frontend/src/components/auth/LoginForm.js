import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom';

import axios from 'axios';
import { Button, Form, FormGroup } from 'reactstrap';
import { Field, reduxForm } from 'redux-form'
import history from './../../history';

import { setProfile } from './../../actions/UserAction';

import config from './../../config';
import styles from './styles.css';

/**
 * 완전히 내 마음대로 마구 짜놓은 코드...!
 * 
 * 1. 일단 onSubmit()에서 서버로 요청을 보내기 전에, 필요한 필드들이 모두 채워져있는지
 *    앞단에서 유효성 검사는 해준다...
 * 2. this.submitted 필드를 통해서, 요청이 중복으로 전송되는 것은 막아줬다.
 * 3. 서버로부터 응답을 정상적으로 받아오면, 로그인이 된 것이므로 sessionStorage에 token을 담는다.
 *    -> 브라우저의 웹스토리지는 브라우저의 내부 스토리지를 사용하는 것이다.
 *       여기서 sessionStorage는 현재 세션 동안에만 유지된다.
 *       같은 브라우저에서 여러개의 탭을 통해 테스트를 해봐야 했기 때문에 일단 sessionStorage에 담았다.
 *      
 *       웹 스토리지가 쿠키보다 나은 것은
 *       1) 일단 용량이 훨씬 크고, 쿠키는 4kb, 로컬스토리지는 5mb
 *       2) 쿠키는 HTTP 요청에 암호화되지 않고 오가는데, 로컬스토리지는 저장하고 보내기 전후로 암호화 작업을 해줄 수 있을 것 같다.
 *          애초에 암호화 작업이 필요한 정보가 클라와 서버를 오가는 것 자체가 설계상의 문제라고는 한다.
 * 
 * 4. window.location.reload()를 호출해 화면을 갱신해준다.
 *    -> 이 부분에도 문제가 많다. React/Redux의 생명주기를 전혀... 이해하지 못하고 있기 때문에 들어간 코드인 것 같다ㅠㅠ
 *    차라리 React-Router 패키지의 <Redirect> 컴포넌트를 쓰는 것은 어떨까...!
 * 
 *    이래도 해결되지 않는다. 새로 화면이 갱신되기는 하는데, 이후에 MainComponent에서 공지 리스트든 등급 리스트든
 *    리스트들을 쿼리해오는 과정에서 400 에러가 뜬다. 이건 토큰이 제대로 없다는 뜻인데...
 *    sessionStorage에는 저장되어 있는데 이걸 reload 해야만 가져올 수 있다는 게 문제인 것 같다.
 */

// validation용 필드
const renderField = ({ input, label, placeholder, type }) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} id={label} className={`field-${label} form-control`} 
        placeholder={placeholder} type={type} />
    </div>
  </div>
);

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      navigate: false,
      isValid: true
    }

    this.submitted = false;
  }  
  
  onSubmit(props){
    // 초기화
    this.setState({isValid: true}); 

    ['ID', 'Password'].forEach((field) => {
      window.$('.field-'+field).css("border", "");
      window.$('.tag-'+field).hide();

      if (!props[field.toLowerCase()]) {
        window.$('.field-'+field).css("border", "red solid 1px");
        window.$('.tag-'+field).show();

        this.setState({isValid: false});
      }
    });

    if (props.password && props.password.length < 8) {
      window.$('.field-Password').css("border", "red solid 1px");
      window.$('.tag-Password').text('비밀번호는 8자 이상입니다.');
      window.$('.tag-Password').show();

      this.setState({isValid: false});
    }

    if (this.state.isValid) {
      if (this.submitted) {
        alert("요청이 전송되었습니다. 잠시만 기다려주세요!");
      } else {
        this.submitted = true;
        
        const API_URL = `${config.SERVER_HOST}:${config.SERVER_PORT}/api/users/login`;
        axios.post(API_URL, props, {mode: "no-cors"})
        .then((response) => {
            const result = response.data.result;
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("idx", result.profile.idx);

            // 다음으로 프로필을 저장합니다!
            this.props.setProfile(result.profile);

            // 화면을 갱신해줍니다.               
            // return <Redirect to="/" />
            window.location.reload();
          })
        .catch(error => {
            console.dir(error);
            if (error.response) {
              if (error.response.data.code === 23400) {
                window.$('.field-ID').css("border", "red solid 1px");
                window.$('.tag-ID').text('존재하지 않는 ID입니다.');
                window.$('.tag-ID').show();
              } else if (error.response.data.code === 24400) {
                window.$('.field-Password').css("border", "red solid 1px");
                window.$('.tag-Password').text('비밀번호가 일치하지 않습니다.');
                window.$('.tag-Password').show();
              }
            }
        });
      }
    }
  }

  componentWillMount() {
    if (sessionStorage.getItem("token")) {
      history.push('/main');
    }
  }

  render() {
    const { handleSubmit, submitting } = this.props;
    
    return (
      <Form className='form' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <h1 className='form-title'>웹 푸시를 테스트합니다</h1>
        <hr />
        <div className='form-tab'>
          <FormGroup>
            <Field component={renderField} name="id" type="text"
              label="ID" placeholder="아이디를 입력해주세요. (test)" />
            <p className="form-error-tag tag-ID">아이디를 입력해주세요.</p>
          </FormGroup>
          <FormGroup>
            <Field component={renderField} name="password" type="password"
              label="Password" placeholder="비밀번호를 입력해주세요. (qwer1234)" />
            <p className="form-error-tag tag-Password">비밀번호를 입력해주세요.</p>
          </FormGroup>
        </div>
        <Button type='submit' disabled={submitting} className='form-button login-button'>LOG IN</Button>
        <Link to="/signup"><Button className='signup-button'>회원가입 하러가기!</Button></Link>
      </Form>
    );
  };
};

LoginForm = connect(null, { setProfile })(LoginForm);

export default reduxForm({
  form: 'login'
})(LoginForm);