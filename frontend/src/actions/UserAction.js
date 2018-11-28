import axios from 'axios';
import config from './../config.js';

export const GET_PROFILE = "GET_PROFILE";
export const SET_PROFILE = "SET_PROFILE";
export const GET_NOTIES  = "GET_NOTIES";

const ROOT_URL = `${config.SERVER_HOST}:${config.SERVER_PORT}/api`;

let token = '';
if (sessionStorage.getItem("token")) {
  token = sessionStorage.getItem('token');
}

let idx = '';
if (sessionStorage.getItem("idx")) {
  idx = sessionStorage.getItem("idx");
}

export function setProfile(data) {
  return {
    type: SET_PROFILE,
    payload: data
  }
}

export function getProfile() {
  const request = axios.get(`${ROOT_URL}/users/${idx}`,
    { headers: {"token": token}});

  return {
    type: GET_PROFILE,
    payload: request
  }
}

export function getNoties() {
  const request = axios.get(`${ROOT_URL}/users/noties`,
    { headers: {"token": token}});

  return {
    type: GET_NOTIES,
    payload: request
  }
}