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
        // db에서 해당 유저의 아이디 조회
        console.log(user);
        if (user) {
          crypto.pbkdf2(
            req.body.password,
            user.salt,
            100000,
            64,
            "sha512",
            async (err, key) => {
              if (err) {
                console.log(err);
              } else {
                const obj = {
                  email: req.body.email,
                  password: key.toString("base64"),
                };
                const user2 = await User.findOne(obj);
                if (user2) {
                  await User.updateOne(
                    {
                      email: req.body.email,
                    },
                    { $set: { loginCnt: 0 } }
                  );
                  req.session.email = user.email;
                  res.json({
                    message: "로그인 되었습니다!",
                    _id: user2._id,
                    email: user2.email,
                  });
                } else {
                  res.json({
                    message: false,
                    sendMsg: "비밀번호 불일치.",
                  });
                }
              }
            }
          );
        } else {
          res.json({ message: false, sendMsg: "아이디 불일치" });
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "로그인 실패" });
  }
});

router.get("/logout", (req, res) => {
  console.log("로그아웃" + req.sessionID);
  req.session.destroy(() => {
    res.json({ message: "로그아웃 되었습니다." });
  });
});

module.exports = router;
