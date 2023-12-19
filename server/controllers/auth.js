const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const userName = req.body.userName;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      const user = new User({
        userName,
        password: hashedPass,
      });
      return user.save();
    })
    .then((result) => {
      res
        .status(201)
        .json({ message: "User created successfully!", userId: result._id });
    });
};

exports.login = (req, res, next) => {
  const userName = req.body.userName;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ userName: userName })
    .then((user) => {
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (isEqual) {
        const token = jwt.sign(
          { userName: loadedUser.userName },
          "secretdo2rom",
          { expiresIn: "1h" }
        );
        res
          .status(200)
          .json({ token: token, message: "user logged in successfully" });
      }
    });
};
