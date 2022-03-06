const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const axios = require('axios');
const pusher = require('../../config/pusher');
const Device = require('../../models/device');
const { sendMqtt, sendSms } = require('../../utils/channel');

router.post('/list/all', auth, async(req, res) => {
    const list = await Device.find({});
    return res.json({ success: true, list });
})
router.post('/edit/:id', auth, async(req, res) => {
    const device = await Device.findOne({ _id: req.params.id });
    return res.json({ success: true, device });
})
router.post('/set/:id', auth, async(req, res) => {
    const { deviceNumber, status, type } = req.body.data;

    const update = await Device.findByIdAndUpdate({ _id: req.params.id }, {
        $set: {
            deviceNumber,
            type,
            status: (status == true || status == "true") ? "active" : "inactive",

        }
    });
    return res.json({ success: true });
});
let cmds = [];
cmds[":turnon"] = 11;
cmds[":turnoff"] = 22;
cmds[":lock"] = 33;
cmds[":unlock"] = 44;
let smsCmds = [];
smsCmds[":turnoff"] = "untar";
smsCmds[":turnon"] = "as";
router.post('/control/:cmd', auth, async(req, res) => {
    const device = await Device.findOne({ phoneNumber: req.user.phoneNumber });

    if (device != null && device) {
        const id = device ? device.deviceNumber : 869523050100420;
        const data = {
            "topic": "gps/command",
            "payload": {
                "id": id,
                "command": cmds[req.params.cmd]
            },
            "qos": 0,
            "retain": false,
            "clientid": id
        }

        if (device.type == "4g") {

            const options = {
                auth: {
                    username: process.env.MQTT_USER_NAME,
                    password: process.env.MQTT_USER_PWD,
                }
            }
            const response = await sendMqtt(data, options, res);
            if (response != null && response.data) {
                res.json({ success: true, action: req.params.cmd, result: response.data });
            } else {
                res.json({ success: false, action: req.params.cmd, err: "can not send request ..." });
            }
        }
        if (device.type == "sms") {
            if (req.params.cmd == ":turnon" || req.params.cmd == ":turnoff") {
                // mobile: iot number, from user phone number right?
                const params = {
                    uname: process.env.SMS_USER_NAME,
                    upass: process.env.SMS_USER_PWD,
                    from: device.phoneNumber, // will be make pusher channel, like "sms-${phoneNumber}"
                    sms: smsCmds[req.params.cmd],
                    mobile: id, // IoT phone number
                }
                const response = await sendSms(params, {}, res);
                if (response != null && response.data) {
                    //   console.log(response.data);
                    res.json({ success: true, action: req.params.cmd, result: response.data });
                } else {
                    res.json({ success: false, action: req.params.cmd, err: "can not send request ..." });
                }
            } else {
                res.json({ success: false, action: req.params.cmd, err: "unsupported methods.." });
            }
        }
    } else {
        return res.json({ success: false, action: req.params.cmd, err: "not found device..." });
    }

})

// from sms iot
router.post('/received/sms', (req, res) => {
    const channel = `sms-${req.body.phoneNumber}`
    pusher.trigger(channel, 'sms-received', {
        data: req.body.status
    });
    res.sendStatus(200);
});
module.exports = router;