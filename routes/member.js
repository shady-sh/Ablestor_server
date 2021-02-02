const express = require("express");
const User = require("../schemas/user");
const crypto = require("crypto");
const router = express.Router();

//Register
router.post("/register", async (req, res) => {
  try {
    let obj = { email: req.body.email };
    let user = await User.findOne(obj);

    if (user) {
      res.json({
        message: "이미 회원가입된 유저입니다.",
        dupYn: "1",
      });
    } else {
      crypto.randomBytes(64, (err, buf) => {
        if (err) {
          console.log(err);
        } else {
          crypto.pbkdf2(
            req.body.password,
            buf.toString("base64"),
            100000,
            64,
            "sha512",
            async (err, key) => {
              if (err) {
                console.log(err);
              } else {
                buf.toString("base64");
                obj = {
                  name: req.body.name,
                  email: req.body.email,
                  password: key.toString("base64"),
                  salt: buf.toString("base64"),
                };
                user = new User(obj);
                await user.save();
                res.json({ message: "회원가입 되었습니다!", dupYn: "0" });
              }
            }
          );
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.json({ message: false });
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    await User.findOne({ email: req.body.email }, async (err, user) => {
      if (err) {
        console.log(err);
      } else {
        console.log(user);
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "로그인 실패" });
  }
});

module.exports = router;
