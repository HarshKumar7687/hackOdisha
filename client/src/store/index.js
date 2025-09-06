import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk'; // Correct import for named export
import contestReducer from './contestSlice';

const rootReducer = combineReducers({
  contest: contestReducer,
  // Add other reducers here if needed
});

export const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;