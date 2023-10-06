const jsend = require('./jsend.js');
const jwt = require('jsonwebtoken');

const CheckAuth = (permissionType) => (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, 'secretToken', (err, decoded) => {
      if (err) return res.status(401).json(jsend.ERROR('Invaild Token'));
      decoded.type === permissionType && next();
    });
  }
  console.log(req);
  return res.status(401).json(jsend.ERROR('No Request User Permission'));
};

module.exports = { CheckAuth };
