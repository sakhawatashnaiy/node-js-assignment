const mongoose = require('mongoose');
const uri = 
            'mongodb+srv://sakhawatashnaiy09_db_user:k3ltLgXRtKnx81T5@cluster0.4ceqqia.mongodb.net/Tododata';

async function connectDB(){
      await mongoose.connect(uri)
}


module.exports = {
     connectDB
}