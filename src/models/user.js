const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const Task = require("../models/task");
const { deleteMany } = require("../models/task");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "whay not"],
    },
    email: {
      type: String,
      require: true,
      trim: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("not email");
        }
      },
    },
    age: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 18) {
          throw new Error("must be adult");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],avatar:{
      type:Buffer
    }
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    //check if the user is modified if user update his pass or register new user will return tru
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
userSchema.pre("remove", async function (next) {
  const user = this;
  try{
    await Task.deleteMany({ owner:user._id });

  }catch(e)
  {
    resizeBy.send(e)
  }
  next();
});
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("not found");
  }
  return user;
};
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});
userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
userSchema.methods.toJSON = function () {
  user = this;
  const obj = user.toObject();
  delete obj.tokens;
  delete obj.password;
  delete obj.avatar;
  return obj;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
