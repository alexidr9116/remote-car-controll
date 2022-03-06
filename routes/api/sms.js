const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const axios = require('axios');
const pusher = require('../../config/pusher');
const Device = require('../../models/device');
const { sendMqtt, sendSms } = require('../../utils/channel');
const { sendMessageToChannel } = require('../../config/socket');

// from sms iot, iot device call this function using your sms api return hook url
const parseURLParams = (url) => {
    var queryStart = url.indexOf("?") + 1,
        queryEnd = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {},
        i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}
router.get('/sms', async(req, res) => {
    try {
        const data = parseURLParams(req.url);
        const mobile = data.mobile;
        if (mobile) {
            const devices = await Device.find({ deviceNumber: mobile });
            devices.map((device) => {
                const phoneNumber = device.phoneNumber;
                const payload = {
                        ts: data.date,
                        payload: data.msg,
                        from_client_id: phoneNumber,
                    }
                    // console.log(payload, "is payload data ");
                sendMessageToChannel(phoneNumber, payload, "sms");
            });

        }

        return res.status(200).json({ data });
    } catch (err) {
        console.log('err sms hook', err);
        return res.status(400).json(err);
    }

});
module.exports = router;