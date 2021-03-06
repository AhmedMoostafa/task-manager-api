const express = require("express");
require("./db/mongoose");
const taskRouter=require('./routers/task')
const userRouter=require('./routers/user')
const sessionExpress=require('express-session')
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(taskRouter);
app.use(userRouter);

app.get('*',(req,res)=>{
  res.send({error:"not found"})
})
app.listen(port, () => {
    console.log("server started at port " + port);
  });
