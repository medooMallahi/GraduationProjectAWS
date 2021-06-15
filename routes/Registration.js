const express = require("express");
const Router = express.Router();

const RegistrationRoutes = require("../controllers/RegistrationRoute");
const RegistrationRoutesDriver = require("../controllers/RegisterationRoutesDriver");

Router.post("/api/users/registerDriver", RegistrationRoutesDriver.register);
Router.post("/api/users/logInDriver", RegistrationRoutesDriver.logIn);
Router.post("/api/users/registerUser", RegistrationRoutes.register);
Router.post("/api/users/logInUser", RegistrationRoutes.logIn);

Router.get(
  "/api/users/logout",
  RegistrationRoutes.auth,
  RegistrationRoutes.logOut
);
Router.get(
  "/api/users/auth",
  RegistrationRoutes.auth,
  RegistrationRoutes.authing
);

module.exports = Router;
