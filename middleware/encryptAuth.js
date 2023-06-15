const { UserData } = require("../models/user_data");

let auth = (req, res, next) => {
  let token = req.body.userToken

  UserData.findByToken(token)
    .then((userData) => {
        
      if (!userData)
        return res.status(400).json({ isAuth: false,message : "Cannot find such user", error: true});

      req.token = token;
      req.userData = userData;
      next();
    })
    .catch((err) => {
      return res.status(400).json({ isAuth: false, error: err});
    });
};

module.exports = { auth };