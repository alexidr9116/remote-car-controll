const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const DeviceSchema = new Schema({
  phoneNumber: {
    type: String,
    default: ""
  }, 
  deviceNumber: {
    type: String,
    default: ""
  },
  type:{
    type:String,
    default:"4g",
  },
  createdAt:{
    type:Date,
    default:Date.now()
  },
  status:{
    type:String,
    default:"active",
  },

});
module.exports = Device = mongoose.model("device", DeviceSchema);