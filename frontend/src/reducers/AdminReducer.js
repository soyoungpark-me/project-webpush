import { FETCH_GRADE } from './../actions/AdminAction';
// import checkError from './../checkError';

const INITIAL_STATE = {
  grades: null
}

export default function(state = INITIAL_STATE, action) {
  // checkError(action);

  switch(action.type) {      
    case FETCH_GRADE:
      if (action.payload && action.payload.data)
        return { ...state, grades: action.payload.data.result }
      else
        return { ...state, grades: null }     

    default:
      return state;
  }
}