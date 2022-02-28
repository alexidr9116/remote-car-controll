const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const request = require('request');
const http = require('http');
const Device = require('../../models/device');
router.post('/list/all',auth,async(req,res)=>{
    const list = await Device.find({});
    return res.json({success:true,list});
})
router.post('/edit/:id',auth,async(req,res)=>{
    const device = await Device.findOne({_id: req.params.id});
    return res.json({success:true, device});
})
router.post('/set/:id',auth,async(req,res)=>{
    const {deviceNumber, status, type} = req.body.data;
    
    const update = await Device.findByIdAndUpdate({_id:req.params.id},{
        $set:{
            deviceNumber,
            type,
            status:(status ==true || status =="true")?"active":"inactive",
            phoneNumber:req.user.phoneNumber,
        }
    });
    return res.json({success:true});
});
router.post('/control/:cmd', auth, async(req,res)=>{
    const device = await Device.findOne({phoneNumber:req.user.phoneNumber});
    if(device!=null && device){
        const data = {
            command:req.params.cmd,
            id:device.deviceNumber,
        };
        const options = {
            headers:{"Connection":"close"},
            url:'http://8.218.12.18:8081/api/v4/mqtt/publish',
            method:'post',
            json:true,
            body:data
        }
        request(options,(err,response,data)=>{
            if(!err && response.statusCode == 200){
                console.log("fetched...",data);
                return res.json({success:true,action:req.params.cmd,data});
            }
            else if(err){
                console.log("err...",err);
                return res.json({success:false,action:req.params.cmd,err});
            }
            else{
                console.log("unknown...");
                return res.json({success:false,action:req.params.cmd,err:"unknown error"});
            }
        });
        
    }
    else{
        return res.json({success:false,action:req.params.cmd,err:"not found device..."});
    }

    
    
})
module.exports = router;