const express = require("express");
const Router = express.Router();

const Funcs = require("../controllers/Func");

Router.post("/api/users/findNearByDriver", Funcs.FindNearByDriver);
Router.post("/api/users/updateDriverLocation", Funcs.updateDriverLocation);
module.exports = Router;
