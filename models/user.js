const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
  phoneNumber:{
    type:String,
  },
  status:{
    type:String,
    default:"active"
  },
  role:{
    type:String,
    default:'user',
  }
});
module.exports = User = mongoose.model("user", UserSchema);