const mongoose = require('mongoose');

const {Schema} =  mongoose;

 const userSchema = new Schema({
          firstName:{
               type : String,
               required : true,
               minlength : 5,
               maxlength :  10,
               lowercase : true,
               trim :  true,

          },
          lastName : {
              type : String,
              required  : true,
              lowercase : true,
              trim : true,

          },
          age :{
              type : Number,
              required : true,
              lowercase : true,
              trim : true,
          },
          password : {
              type : String,
              required : true,
              minlenght: 12,
              maxlength  : 20,
          },
          gender : {
              type : String,
              required : true,
              enum: ["male", "female", "other"]
          },
          email:{
              type : String,
              required : true,
              index : true, 
              unique :  true,
          },
    } , {
         collection : 'UniqeEmail',
         timestamps : true
    })
       
    

        

    const User = mongoose.model('User' , userSchema);

    module.exports = {
         User
    }