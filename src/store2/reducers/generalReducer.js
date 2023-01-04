const initState = {
  openSidebar: false,
};

const generalReducer = (state = initState, action) => {
  switch (action.type) {
    case "OPEN_SIDE_BAR":
      return { ...state, openSidebar: action.payload };
    default:
      return state;
  }
};

export default generalReducer;
