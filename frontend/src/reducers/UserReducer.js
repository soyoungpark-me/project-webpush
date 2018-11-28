import { SET_PROFILE, FETCH_PROFILE, FETCH_NOTIES, CHECK_NOTIES } from './../actions/UserAction';
// import checkError from './../checkError';

const INITIAL_STATE = {
  profile: null,
  noties: null
}

export default function(state = INITIAL_STATE, action) {
  // checkError(action);

  switch(action.type) {
    case SET_PROFILE: 
      return { ...state, profile: action.payload.data }
      
    case FETCH_PROFILE:
      if (action.payload && action.payload.data)
        return { ...state, profile: action.payload.data.result }
      else
        return { ...state, profile: null }  

    case FETCH_NOTIES:
      if (action.payload && action.payload.data)
        return { ...state, noties: action.payload.data.result }
      else
        return { ...state, noties: null }  
    
    case CHECK_NOTIES:
      return { ...state }

    default:
      return state;
  }
}