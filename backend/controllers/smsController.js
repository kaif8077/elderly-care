const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

exports.sendSMS = async (req, res) => {
    const { body } = req.body;
    const RECIPIENT = "+918528576249"; // Your specific Indian number
    
    try {
        const message = await twilioClient.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER, // Your +1 number
            to: RECIPIENT
        });
        
        console.log(`Message SID: ${message.sid}`);
        res.status(200).json({ 
            success: true,
            sid: message.sid
        });
        
    } catch (error) {
        console.error("Twilio Error:", error);
        res.status(400).json({
            error: "SMS failed",
            code: error.code,
            solution: error.code === 21608 
                ? "Verify recipient number in Twilio console" 
                : "Check Twilio number capabilities"
        });
    }
};