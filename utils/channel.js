const axios = require('axios');

const sendSms = async(data, options, res) => {
    try {
        // const url = `${process.env.SMS_SERVICE_URL}?uname=${process.env.SMS_USER_NAME}&upass=${process.env.SMS_USER_PWD}&from=${data.from}&mobile=${data.mobile}&sms=sendsms`;
        const SMS_ADMIN_PHONE_NUMBER = 132933;
        const url = `${process.env.SMS_SERVICE_URL}?uname=${process.env.SMS_USER_NAME}&upass=${process.env.SMS_USER_PWD}&from=${SMS_ADMIN_PHONE_NUMBER}&mobile=${data.mobile}&sms=${data.sms}`;
        // const url = "http://sms.unitel.mn/sendSMS.php?uname=elec&upass=Unitel88&sms=as&from=132933&mobile=89932933";
        // send command to iot device
        const response = await axios.get(url, {});
        return response;
    } catch (err) {
        console.log(err, "is error");
        return null;
    }

}
const sendOtp = async(phoneNumber, otp) => {
    try {
        const SMS_ADMIN_PHONE_NUMBER = 132933;
        const url = `${process.env.SMS_SERVICE_URL}?uname=${process.env.SMS_USER_NAME}&upass=${process.env.SMS_USER_PWD}&from=${SMS_ADMIN_PHONE_NUMBER}&mobile=${phoneNumber}&sms=Verify code is ${otp}`;
        const response = await axios.get(url, {});

        return response;
    } catch (err) {
        return null;
    }

}
const sendMqtt = async(data, options, res) => {
    try {
        const response = await axios.post(process.env.MQTT_SERVICE_URL, data, options);

        return response;
    } catch (err) {
        return null;
    }


}
module.exports = { sendSms, sendMqtt, sendOtp }