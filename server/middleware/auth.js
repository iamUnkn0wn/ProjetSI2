const config = require("config");
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) res.status(401).send("Access denied, User not logged in.");

  try {
    const decoded = jwt.decode(token, config.get("jwtPrivateKey"));
    res.user = decoded;

    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
}

module.exports = auth;
