const mongoose = require("mongoose")
const { Schema, model } = mongoose

 taskSchema = new Schema ({

  subjet:String,
  message:String,
  date:Date,
  time:String,
  phone:Number,
  status:Boolean,

  
},
{
timestamps: true
}

)


module.exports = model('Task', taskSchema);
