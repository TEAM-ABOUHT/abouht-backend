const jsend = require('./jsend.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const checkAuth = (permissionType) => (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.SECERT_KEY, (err, decoded) => {
      if (err) return res.status(401).json(jsend.ERROR('Invaild Token'));

      if (decoded.type === permissionType) {
        req.data = decoded;
        return next();
      }
    });
  } else return res.status(401).json(jsend.ERROR('No Request User Permission'));
};

module.exports = { checkAuth };
