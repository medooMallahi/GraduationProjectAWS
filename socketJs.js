const Driver = require("./models/Driver");
const User = require("./models/User");
const mongoose = require("mongoose");

let connection = null;

class Realtime {
  constructor() {
    this.socket = null;
    this.io = null;
  }

  static init(server) {
    if (!connection) {
      connection = new Realtime();
      connection.connect(server);
    }
  } // end of init

  static getConnection() {
    if (!connection) {
      throw new Error("no active connection");
    }
    return connection;
  } // end of getConnection

  connect(server) {
    const options = {
      allowEIO3: true,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    };
    this.io = require("socket.io")(server, options);

    this.io.on("connection", (socket) => {
      this.socket = socket;
      console.log(this.socket.id, " just connected");

      let userData;

      this.socket.on("join", (data) => {
        this.socket.join(data.id);

        userData = data;

        const filter = { _id: mongoose.Types.ObjectId(data.id) };
        const update = {
          socketID: this.socket.id,
        };

        if (data.isDriver === "true") {
          Driver.findOneAndUpdate(filter, update, {
            new: true,
          })
            .then((driver) => {
              console.log(driver);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          User.findOneAndUpdate(filter, update, {
            new: true,
          })
            .then((User) => {
              console.log(User);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }); // end of join

      this.socket.on("disconnect", () => {
        console.log(this.socket.id, " just disconnected");
      }); // end of disconnect
    }); // end of io
  } // end of connect method

  returnIO() {
    return this.io;
  }

  returnSocket() {
    return this.socket;
  }
} // end of Realtime Class

module.exports = {
  connect: Realtime.init,
  connection: Realtime.getConnection,
};
