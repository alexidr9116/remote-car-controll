const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const axios = require('axios');
const pusher = require('../../config/pusher');
const Device = require('../../models/device');
const { sendMqtt, sendSms } = require('../../utils/channel');
const { sendMessageToChannel } = require('../../config/socket');
// from sms iot
router.post('/hook', async(req, res) => {
    try {
        // {
        //     ts: 1646197524752,
        //     topic: 'gps/command',
        //     retain: false,
        //     qos: 0,
        //     payload: '{"id":"89932933","command":44}',
        //     node: 'emqx@127.0.0.1',
        //     from_username: null,
        //     from_client_id: '89932933',
        //     action: 'message_publish'
        //   } 
        sendMessageToChannel(req.body.from_client_id, req.body, "4g");
        /**
        const channel = `mqtt-${req.body.phoneNumber}`
        await pusher.trigger(channel, 'mqtt-received', {
            data: req.body
        });
         */

        return res.status(200).json({ data: req.body });

    } catch (err) {
        console.log('err', err);
        return res.status(400).json(err);
    }

});
module.exports = router;