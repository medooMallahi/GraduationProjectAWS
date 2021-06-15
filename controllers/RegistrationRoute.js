const User = require("../models/User");

const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = (req, res, next) => {
  bycrpt
    .hash(req.body.password, 10)
    .then((hashed) => {
      req.body.password = hashed;

      const user = new User(req.body);
      user
        .save()
        .then((user) => {
          return res.status(200).json({ success: true, user });
        })
        .catch((err) => {
          console.log("Error with user saving");
          console.log(err);
          return res.status(500).json({ success: false });
        });
    })
    .catch((err) => {
      console.log("Error with hashing");
      console.log(err);
      return res.status(500).json({ success: false });
    });
}; // end of register

exports.logIn = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.json({
          loginSuccess: false,
          message: "Auth failed, email not found",
        });

      bycrpt
        .compare(req.body.password, user.password)
        .then((isMatch) => {
          if (!isMatch)
            return res
              .status(200)
              .json({ loginSuccess: false, message: "Wrong password" });

          let token = jwt.sign(
            user._id.toHexString(),
            "SUPERSECRETPASSWORD123"
          );

          user.token = token;
          user
            .save()
            .then((user) => {
              //set a token
              return res.status(200).json({
                loginSuccess: true,
                user,
              });
            })
            .catch((err) => {
              return res.status(400).send({ err, message: "failed" });
            });
        })
        .catch((err) => {
          console.log("error while compairing passwords");
          console.log(err);
          return res.status(400).send(err);
        });
    })
    .catch((err) => {
      console.log("Can't find email");
      console.log(err);
      return res.status(400).send(err);
    });
}; // end of logIn

exports.logOut = (req, res, next) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" })
    .then((doc) => {
      return res.status(200).send({
        success: true,
      });
    })
    .catch((err) => {
      console.log("Error while loging out");
      return res.json({ success: false, err });
    });
}; // end of logOut

exports.auth = (req, res, next) => {
  const token = req.headers.authorization;

  jwt.verify(token, "SUPERSECRETPASSWORD123", (err, decode) => {
    User.findOne({ _id: decode, token: token })
      .then((user) => {
        if (!user)
          return res.json({
            isAuth: false,
            error: "user not found",
          });

        req.token = token;
        req.user = user;
        next();
      })
      .catch((err) => {
        console.log("error while authing");
        console.log(err);
      });
  });
};

exports.authing = (req, res, next) => {
  res.status(200).json({
    isAuth: true,
    email: req.user.email,
  });
}; // end of authing
