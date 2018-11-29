import axios from 'axios';
import config from './../config.js';

export const FETCH_GRADE = "FETCH_GRADE";


const ROOT_URL = `${config.SERVER_HOST}:${config.SERVER_PORT}/api`;

let token = '';
if (sessionStorage.getItem("token")) {
  token = sessionStorage.getItem('token');
}

export function fetchGrade() {
  const request = axios.get(`${ROOT_URL}/grades`,
    { headers: { "token": token }});
    
  return {
    type: FETCH_GRADE,
    payload: request
  }
}