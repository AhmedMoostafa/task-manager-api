const express = require("express");
const Task = require("../models/task");
const aut = require("../middleware/auth");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/tasks", aut, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/tasks", auth, async (req, res) => {
  const user = req.user;
  const match = {};
  const sort={};
  if (req.query.status) {
    match.status = req.query.status === "true";
  }
  if(req.query.sortBy)
  {
/*     he will enter the query lik this sortBy=createdAt:desc || sortBy=name:desc
        then i will split my string into two pices 

        sort[[parts[0]]]=>sort.createdAt||sort.name or any proparty 
         sort[[parts[0]]]=>parts[1] set the value if value = -1 sort in desc order  
 */    
    const parts=req.query.sortBy.split(':');
    sort[parts[0]]=parts[1]==='desc'?-1:1;
  }
  try {
    await user
      .populate({
        path: "tasks",
        match,
        options:{
          limit:parseInt(req.query.limit),
          skip:parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.send(user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    res.send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedToUpadte = ["description", "status"];
  const valid = updates.every((value) => allowedToUpadte.includes(value));
  if (!valid) {
    return res.status(400).send("not valid to update");
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send("not found!");
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
