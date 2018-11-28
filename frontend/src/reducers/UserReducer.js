import { SET_PROFILE, GET_PROFILE } from './../actions/UserAction';
// import checkError from './../checkError';

const INITIAL_STATE = {
  profile: null
}

export default function(state = INITIAL_STATE, action) {
  // checkError(action);

  switch(action.type) {
    case SET_PROFILE: 
      return { ...state, profile: action.payload.data }
      
    case GET_PROFILE:
      if (action.payload && action.payload.data)
        return { ...state, profile: action.payload.data.result }
      else
        return { ...state, profile: null }  

    default:
      return state;
  }
}