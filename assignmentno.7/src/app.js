const express = require('express')
const {connectDB} =  require('./config/database')
const {User} =       require('./model/user');
const validator = require('validator');
const bcrypt =    require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require('./middleware/user')


const app = express()
app.use(express.json())
app.use(cookieParser())

//    signup api

app.post('/signup' , async   (req,res)=>{
    try{
          const {firstName ,lastName ,email ,password}= req.body

          if(!firstName  || !lastName){
               throw new Error('Name is not valid!!')
          }else if(!validator.isEmail(email)){
               throw new Error('Email is not valid!!')
          }else if(!validator.isStrongPassword(password)){
              throw new Error('Please use strong password!!')
          }

          const hashedPassword = await bcrypt.hash(password,10);

        const user = new User({
              firstName,
              lastName,
              email,
              password: hashedPassword 
          })

          await user.save()


            res.status(200).send({
                  message :  'User successfuly signup!!',
                  data : user
            })
      }catch(error){
          res.status(401).send({
              message : 'Something went wrong!',
              error : error.message
          })
      }
})


// signIn api

app.post('/signIn',  async (req,res)=>{
         try{
             const {email, password} =  req.body
             const user = await User.findOne({
                  email
             })

             if(!user){
                  throw new Error('Invalid Credentials!!')
             }

             const IsValidpassword = await bcrypt.compare(password,user.password)

             if(IsValidpassword){
                  const token = await jwt.sign({id:user. _id}, 'Ashnaiy$@3' , {expiresIn: '1d'})


                  res.cookie('token' ,  token);

                  res.status(200).send({
                      message : 'Login successful!',
                  })
             }
         }catch(error){
              res.status(400).send({
                  message : 'login Error',
                  error :  error.message
              })
         }

})
//    logout api
app.post('/logout', async (req,res)=>{
       res.cookie('token' , null, {
            expires : new Date(Date.now()*0)
       })
          res.status(200).send({
              message : 'logout successfuly!'
          })
})

//    get profile api
app.get('/profile' ,userAuth , (req,res)=>{
        const user = req.user

        res.send(user)
})

// addproduct api
  app.put('/addUser', userAuth , async (req,res)=>{
      try{
           const {firstName,lastName} = req.body
        //    console.log("User from add product API-->", firstName);

            res.send(`product added by ${firstName} ${lastName}`)
     }catch(error){
          res.status(400).send({
              message : 'Add product error',
              error : error . message
          })
     }
  })

//    Deleteproductapi
  app.delete('/DeleteUser/:id',userAuth,async(req,res)=>{
      try{
           const {id} =  req.params;

         const user = await User.findByIdAndDelete(id)
                res.send({
                      message : `This user is deleted ${user.firstName} ${user.lastName}`,
                })
       }catch(error){
           res.status(400).send({
               message :  'Error to deleting User',
           })
       }

  })

//   updateproductapi

    app.patch('/updateUser/:id', async (req, res) => {
        try {
            const { id } = req.params
            const data = req.body
            const user = await User.findByIdAndUpdate(
                id, 
                data, 
                { runValidators: true, returnDocument: 'after' })
            res.send({
                message: 'User updated successfully !',
                data: user
            })
        } catch (error) {
            res.status(400).send({
                message: 'Error updating user',
                error: error.message
            })
        } 
    
})




























connectDB().then(()=>{
      console.log('Database is connected successfully!!');
      app.listen(4000, ()=>{
         console.log('Server is running on port 4000'); 
      })
}).catch(()=>{
      console.log('Error to connecting database!!');
})