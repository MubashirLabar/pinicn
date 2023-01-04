import { createStore } from "redux";
import generalReducer from "./reducers/generalReducer";

const store = createStore(generalReducer);

export default store;
