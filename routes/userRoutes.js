const express = require("express");
const Router = express.Router();

const Funcs = require("../controllers/Func");

Router.post("/api/users/rateDriver", Funcs.rateDriver);
Router.post("/api/users/orderDriver", Funcs.orderDriver);

module.exports = Router;
