import axios from 'axios';
import config from './../config.js';

export const FETCH_PROFILE = "FETCH_PROFILE";
export const SET_PROFILE   = "SET_PROFILE";
export const FETCH_NOTIES  = "FETCH_NOTIES";
export const CHECK_NOTIES  = "CHECK_NOTIES";

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

export function fetchProfile() {
  const request = axios.get(`${ROOT_URL}/users/${idx}`,
    { headers: { "token": token }});

  return {
    type: FETCH_PROFILE,
    payload: request
  }
}

export function fetchNoties() {
  const request = axios.get(`${ROOT_URL}/users/noties`,
    { headers: { "token": token }});

  return {
    type: FETCH_NOTIES,
    payload: request
  }
}

export function checkNoties(id) {
  const request = axios.put(`${ROOT_URL}/users/noties`, 
    { "noti": id },
    { headers: { "token": token }});

  return {
    type: CHECK_NOTIES,
    payload: request
  }
}
