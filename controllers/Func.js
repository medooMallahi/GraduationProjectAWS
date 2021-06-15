const mongoose = require("mongoose");
const Driver = require("../models/Driver");
const User = require("../models/User");
const realtime = require("../socketJs");

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

exports.FindNearByDriver = (req, res, next) => {
  const long = req.body.long;
  const lat = req.body.lat;

  Driver.find({
    location: {
      $near: {
        $maxDistance: 10000000,
        $geometry: { type: "Point", coordinates: [long, lat] },
      },
    },
  }).then((doc) => {
    if (!doc[0]) {
      return res.status(200).json({ success: true, driver: "not found" });
    }
    let rate = calcualteRate(doc[0].rate);

    return res.status(200).json({
      success: true,
      driver: {
        id: doc[0]._id,
        name: doc[0].name,
        email: doc[0].email,
        phone: doc[0].phone,
        rate: rate,
        lat: doc[0].location.coordinates[0],
        lon: doc[0].location.coordinates[1],
      },
    });
  });
}; // end of FindNearByDriver

exports.updateDriverLocation = (req, res, next) => {
  const filter = { _id: mongoose.Types.ObjectId(req.body.driverID) };
  const update = {
    "location.coordinates": req.body.location,
  };

  Driver.findOneAndUpdate(filter, update, {
    new: true,
  })
    .then((driver) => {
      return res.json({ success: "true", driver });
    })
    .catch((err) => {
      console.log(err);
      return res.json({ success: "false", err });
    });
};

exports.rateDriver = (req, res, next) => {
  const userRate = req.body.rate;

  Driver.findOne({ _id: mongoose.Types.ObjectId(req.body.driverID) })
    .then((driver) => {
      switch (userRate) {
        case 1:
          driver.rate[0] += 1;
          driver.rate.set(0, driver.rate[0]);
          driver.save().then((savedDoc) => {
            console.log(savedDoc == driver);
          });
          break;
        case 2:
          driver.rate[1] += 1;
          driver.rate.set(1, driver.rate[1]);
          driver.save().then((savedDoc) => {
            console.log(savedDoc == driver);
          });
          break;
        case 3:
          driver.rate[2] += 1;
          driver.rate.set(2, driver.rate[2]);
          driver.save().then((savedDoc) => {
            console.log(savedDoc == driver);
          });
          break;
        case 4:
          driver.rate[3] += 1;
          driver.rate.set(3, driver.rate[3]);
          driver.save().then((savedDoc) => {
            console.log(savedDoc == driver);
          });
          break;
        case 5:
          driver.rate[4] += 1;
          driver.rate.set(4, driver.rate[4]);
          driver.save().then((savedDoc) => {
            console.log(savedDoc == driver);
          });
          break;
        default:
          console.log("No Value");
          break;
      }
    })
    .catch((err) => {
      console.log(err);
    });
  res.json({ status: "done" });
};

exports.orderDriver = (req, res, next) => {
  const driverID = req.body.driverID;
  const clientID = req.body.clientID;
  const clientName = req.body.clientName;
  const clientLong = req.body.long;
  const clientLat = req.body.lat;

  const data = {
    clientName,
    clientID,
    clientLong,
    clientLat,
  };

  console.log(data);

  const connection = realtime.connection();

  const io = connection.returnIO();

  let DriverSocket;
  let ClientSocket;

  Driver.findOne({ _id: mongoose.Types.ObjectId(driverID) })
    .then((doc) => {
      DriverSocket = io.sockets.sockets.get(doc.socketID);

      // 1- driver recieve an order
      io.sockets.in(driverID).emit("newOrder", data);

      // 2- server recive the answer from the driver
      DriverSocket.on("driverAnswer", (msg) => {
        console.log(`driver accept${msg.answer}`);

        User.findOne({ _id: mongoose.Types.ObjectId(clientID) })
          .then((doc) => {
            ClientSocket = io.sockets.sockets.get(doc.socketID);

            if (msg.answer === 1) {
              ClientSocket.emit("driverDecision", true);
              DriverSocket.on("orderFinish", () => {
                console.log("order was finised");
                //store this order
              });
            } else {
              ClientSocket.emit("driverDecision", false);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })

    .catch((err) => {
      console.log(err);
    });

  return res.status(200).json({ state: "true" });
};
