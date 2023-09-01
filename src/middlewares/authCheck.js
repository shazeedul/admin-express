const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("authorization");
  if (!token) return res.status(400).send("Access Denied!, no token entered");

  try {
    token = token.split(" ")[1];
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send({ error: "auth failed, enter a valid token"+err });
  }
};