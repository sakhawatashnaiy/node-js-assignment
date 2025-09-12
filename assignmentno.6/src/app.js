const express = require('express');

const {connectDB} = require('./config/database');

const {User} =     require('./model/user');

const app = express();

app.use(express.json());


  app.use('/addUser' , async (req,res)=>{
         
        try{
              const body = req.body
              const user = await new User(data)
              await user.save();
              res.send({
                  message : 'User added successfully!',
                  data : user
              })
        }catch(error){
             res.status(400).send({
                 message : 'error adding user',
                 error : error.message
             })
        }
  })

connectDB().then(()=>{
      console.log('Database connected sucessfully!');
      app.listen(5000, (req,res)=>{
          console.log('Server is running on port 5000');
      })
}).catch(()=>{
      console.log('Database not connect Error!!');
})