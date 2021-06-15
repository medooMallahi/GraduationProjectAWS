const Driver = require("../models/Driver");

const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let calcualteRate = (array = []) => {
  let calculate = false;

  for (let i = 0; i < array.length; i++) {
    if (array[i] > 0) {
      calculate = true;
      break;
    }
  }

  let rate = 0;

  if (calculate) {
    rate =
      (5 * array[4] +
        4 * array[3] +
        3 * array[2] +
        2 * array[1] +
        1 * array[0]) /
      (array[4] + array[3] + array[2] + array[1] + array[0]);
  } else {
    rate = 0;
  }

  return rate;
};

exports.register = (req, res, next) => {
  bycrpt
    .hash(req.body.password, 10)
    .then((hashed) => {
      req.body.password = hashed;

      const location = {
        type: "Point",
        coordinates: [req.body.long, req.body.lat],
      };

      const driver = new Driver({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        location: location,
      });

      driver
        .save()
        .then((driver) => {
          return res.status(200).json({
            success: true,
            id: driver._id,
            name: driver.name,
            email: driver.email,
            lat: driver.location.coordinates[0],
            lon: driver.location.coordinates[1],
          });
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
};

exports.logIn = (req, res, next) => {
  Driver.findOne({ email: req.body.email })
    .then((driver) => {
      if (!driver)
        return res.json({
          loginSuccess: false,
          message: "Auth failed, email not found",
        });

      bycrpt
        .compare(req.body.password, driver.password)
        .then((isMatch) => {
          if (!isMatch)
            return res
              .status(200)
              .json({ loginSuccess: false, message: "Wrong password" });

          let token = jwt.sign(
            driver._id.toHexString(),
            "SUPERSECRETPASSWORD123"
          );

          driver.token = token;
          driver
            .save()
            .then((driver) => {
              let rate = calcualteRate(driver.rate);

              return res.status(200).json({
                loginSuccess: true,
                token,
                id: driver._id,
                name: driver.name,
                email: driver.email,
                phone: driver.phone,
                rate: rate,
                lat: driver.location.coordinates[0],
                lon: driver.location.coordinates[1],
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
  Driver.findOneAndUpdate({ _id: req.driver._id }, { token: "" })
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
    Driver.findOne({ _id: decode, token: token })
      .then((driver) => {
        if (!driver)
          return res.json({
            isAuth: false,
            error: "user not found",
          });

        req.token = token;
        req.driver = driver;
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
    email: req.driver.email,
  });
}; // end of authing
