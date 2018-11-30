import { SET_WEB_NOTIFY_ENABLE, SET_WEB_NOTIFY_UNABLE,
  SET_SOCKET_CONNECTED } from './../actions/AppAction.js';
// import checkError from './checkError';

let ignore = '';

if (Notification && Notification.permission === 'granted') {
  ignore = true;
} else {
  ignore = false;
}

const initialState = {
  ignore,
  socket: null
};

export default function data (state = initialState, action) {
  // checkError(action);

  switch (action.type) {
    case SET_SOCKET_CONNECTED:
      return { ...state, socket: action.payload };

    case SET_WEB_NOTIFY_ENABLE:
      return { ...state, ignore: false};

    case SET_WEB_NOTIFY_UNABLE:
      return { ...state, ignore: true};

    default:
      return state;
  }
}