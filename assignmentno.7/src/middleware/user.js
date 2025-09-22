const jwt = require('jsonwebtoken')

const {User} =   require('../model/user')


const userAuth = async (req,res,next)=>{
     try{
          const {token} = req.cookies
     
     if(!token){
         throw new Error ('token is not valid!!') 
     }
      const {id} = await jwt.verify(token, 'Ashnaiy$@3');

      const user = await User.findOne({_id : id})

      if(!user){
           throw new Error ('user not found!')
      }
      req.user = user
      next()
}catch(error){
      res.status(401).send({
          message :  "ERROR : " + error.message,
      })
}

}

module.exports= {
      userAuth
}
