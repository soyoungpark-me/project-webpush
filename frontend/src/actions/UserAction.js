import axios from 'axios';
import config from './../config.js';

export const GET_PROFILE = "GET_PROFILE";
export const SET_PROFILE = "SET_PROFILE";

const ROOT_URL = `${config.SERVER_HOST}:${config.SERVER_PORT}/api`;

export function setProfile(data) {
  return {
    type: SET_PROFILE,
    payload: data
  }
}

export function getProfile(index) {
  let token = '';
  if (sessionStorage.getItem("token")) {
    token = sessionStorage.getItem('token');
  }

  const request = axios.get(`${ROOT_URL}/users/${index}`,
    { headers: {"token": token}});

  return {
    type: GET_PROFILE,
    payload: request
  }
}