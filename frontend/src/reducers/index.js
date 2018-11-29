import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

import AppReducer from './AppReducer';
import UserReducer from './UserReducer';
import AdminReducer from './AdminReducer';

const rootReducer = combineReducers({
  form: formReducer,
  app : AppReducer,
  user: UserReducer,
  admin: AdminReducer
});

export default rootReducer;
