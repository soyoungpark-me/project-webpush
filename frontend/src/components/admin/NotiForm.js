import React, { Component } from 'react';
import { connect } from 'react-redux';
import Loader from 'react-loader-spinner';

import axios from 'axios';
import { Button, Form, FormGroup } from 'reactstrap';
import { Field, reduxForm, reset } from 'redux-form'
import history from './../../history';

import { fetchGrade } from './../../actions/AdminAction';

import config from './../../config';
import styles from './styles.css';

function mapStateToProps(state) {
  return {
    grades: state.admin.grades
  };
}

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

class NotiForm extends Component {
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
    this.setState({isValid: false}); 
    
    if (this.state.isValid) {
      if (this.submitted) {
        alert("요청이 전송되었습니다. 잠시만 기다려주세요!");
      } else {
        // 필드가 하나도 채워져 있지 않을 경우에는 요청을 보내지 않습니다.
        if (Object.keys(props).length === 0) {
          alert("최소 하나의 필드는 채워주세요!");  
          window.location.reload(); // 방법이 맞는지는 모르겠지만 ㅠㅠ 강제로 화면을 갱신합니다.
          return;
        }

        // POST로 보낼 body 값을 만들어줍니다.
        let body = { notifications: [] };
        Object.keys(props).map((key) => {
          if (props[key] !== "") this.setState({isValid: true}); 

          body.notifications.push({
            "target": key,
            "contents": props[key]
          });
        });

        const API_URL = `${config.SERVER_HOST}:${config.SERVER_PORT}/api/noties`;
        axios.post(API_URL, body, { headers: { token: sessionStorage.getItem("token") }},{mode: "no-cors"})
        .then((response) => {
            console.dir(response);
            if (response.status === 201) {
              alert("공지가 성공적으로 전송되었습니다!");      
              window.location.reload();
              return;
            }
          })
        .catch(error => {
            console.dir(error);            
        });

        this.submitted = true;
      }
    }
  }

  componentWillMount() {
    this.props.fetchGrade();
  }

  renderGrades(){
    return this.props.grades
      .map((grade, i) => {
        return (
          <FormGroup key={i}>
            <Field component={renderField} name={grade.name} type="text"
              label={grade.name} placeholder={`${grade.name} 등급의 유저에게 공지를 보냅니다`} />
          </FormGroup>
        )
    });
  }

  render() {
    const { handleSubmit, submitting } = this.props;

    let contents = null;
    if (this.props.grades) {
      contents = this.renderGrades();
    } else {
      contents = <Loader type="Oval" color="#1FBF28" height="130" width="130" />;
    }
    
    return (
      <div className="contents-wrapper">
        <Form className='form' onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <h1 className='form-title'>웹 푸시를 보냅니다!</h1>
          <hr />
          <div className='form-tab'>
            {contents}
          </div>
          <Button type='submit' disabled={submitting} className='noti-form-button'>GO!</Button>
        </Form>
      </div>
    );
  };
};

NotiForm = connect(mapStateToProps, { fetchGrade, reset })(NotiForm);

export default reduxForm({
  form: 'noti'
})(NotiForm);