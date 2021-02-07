const express = require("express");
const User = require("../models/user");
const sharp=require('sharp')
const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const {sendWelcomeEmail,cancelEmail}=require('../emails/account')
const avatar = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("please upload jpg or png or jpeg "));
    }
    cb(undefined, true);
  },
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const user = new User(req.body);
    await user.save();
    await  sendWelcomeEmail(user.email,user.name)
    const token = await user.generateToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({error:'already exist'}); 
  }
});
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});
router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    res.send(user);
  } catch (e) {
    res.status(404).send(e);
  }
});
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body); //convert the object to array
  const allowedToUpadte = ["name", "age", "email", "password"];
  const valid = updates.every((value) => allowedToUpadte.includes(value));
  if (!valid) {
    return res.status(400).send("not valid to update");
  }
  try {
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.delete('/users/me', auth, async (req, res) => {

  if(req.user)
  {
    await req.user.remove();
    await cancelEmail(req.user.email,req.user.name)
    res.send()
  }
   
  
})

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateToken();

    res.send({ user, token });
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/users/me/avatar",auth,avatar.single("avatar"),async (req, res) => {

  const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
     req.user.avatar = buffer;
    await req.user.save();  
    res.send();
  },
  (error, req, res, next) => {
    console.log(error.message)
    res.send({ "error ": error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  try {
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get('/users/:id/avatar',async(req,res)=>{
    try{
      const user=await User.findById(req.params.id)
      if(!user||!user.avatar)
      {
        throw new Error('error')
      }
      res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e)
    {
      res.status(404).send(e)
      
    }
})
module.exports = router;
