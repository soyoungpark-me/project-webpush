import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

import AppReducer from './AppReducer';
import UserReducer from './UserReducer';

const rootReducer = combineReducers({
  form: formReducer,
  app : AppReducer,
  user: UserReducer
});

export default rootReducer;
