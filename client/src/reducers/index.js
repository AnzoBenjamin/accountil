import { combineReducers } from "redux";

import invoices from "./invoices";
import clients from "./clients";
import auth from "./auth";
import profiles from "./profiles";
import inventory from "./inventory";
export default combineReducers({
  invoices,
  clients,
  auth,
  profiles,
  inventory,
});
