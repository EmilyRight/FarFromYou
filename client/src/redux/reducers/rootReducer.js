import { combineReducers } from 'redux';
import loaderReducer from './loaderReducer';
import userReducer from './userReducer';
import audioReducer from './audioReducer';
import stopReducer from './stopReducer';

const rootReducer = combineReducers({
  user: userReducer,
  loader: loaderReducer,
  audio: audioReducer,
  logoutStop: stopReducer,
});

export default rootReducer;
