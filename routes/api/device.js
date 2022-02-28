const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const axios = require('axios');

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
            auth:{
                username:'admin',
                password:'public'
            }
        }
        axios.post("http://45.76.188.38:8081/api/v4/mqtt/publish",options,(err,{result})=>{
            if(err){
                console.log(err);
                return res.json({success:false,action:req.params.cmd,err});                
            }
            if(result){
                console.log(result);
                return res.json({success:false,action:req.params.cmd,err:result});
            }
            
        })

        
    }
    else{
        return res.json({success:false,action:req.params.cmd,err:"not found device..."});
    }

    
    
})
module.exports = router;