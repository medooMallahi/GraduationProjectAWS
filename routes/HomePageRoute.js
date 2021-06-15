const express = require("express");
const Router = express.Router();

const HomePageRouteController = require("../controllers/HomePageRouteController");

Router.get("/", HomePageRouteController.HomePageRoute);

module.exports = Router;
