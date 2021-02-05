const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const obj = jwt.verify(token, "toookkkeeennn");
    const user = await User.findOne({ _id: obj._id, "tokens.token": token });
    if (!user) {
      throw new Error("please authenticate")
  }
  req.token = token;
    req.user = user;
  } catch (e) {
    res.status(404).send({"error":"please authenticate"});
  }
  next();
};
module.exports = auth;
