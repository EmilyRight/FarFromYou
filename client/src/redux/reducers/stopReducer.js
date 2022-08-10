/* eslint-disable default-param-last */
const audioReducer = (state = false, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_STOP':
      return payload;
    default:
      return state;
  }
};

export default audioReducer;
