import io from 'socket.io-client';

import config from './../config.js';

export const SET_SOCKET_CONNECTED = 'SET_SOCKET_CONNECTED';
export const SET_WEB_NOTIFY_ENABLE = 'SET_WEB_NOTIFY_ENABLE';
export const SET_WEB_NOTIFY_UNABLE = 'SET_WEB_NOTIFY_UNABLE';

const SOCKET_API_URL = `${config.SERVER_HOST}:${config.SERVER_PORT}`;

let token;

if (sessionStorage.getItem('token')) {
  token = sessionStorage.getItem('token');
}

export function setSocketConnected() {
  let socket = null; 
  
  if(token !== null && token !== undefined) {
    socket = io.connect(SOCKET_API_URL, {transports: ['websocket']}, {rejectUnauthorized: false});
  }

  return {
    type: SET_SOCKET_CONNECTED,
    payload: socket
  };
}

export function handlePermissionGranted(){
  console.log('Permission Granted');

  return {
    type: SET_WEB_NOTIFY_ENABLE,
    payload: false
  };
}

export function handlePermissionDenied(){
  console.log('Permission Denied');

  return {
    type: SET_WEB_NOTIFY_UNABLE,
    payload: true
  };
}

export function handleNotSupported(){
  console.log('Web Notification not Supported');

  return {
    type: SET_WEB_NOTIFY_UNABLE,
    payload: true
  };
};