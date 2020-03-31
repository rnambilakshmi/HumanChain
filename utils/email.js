require('dotenv').config();

const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');



console.log(process.env.EMAIL_USERNAME, process.env.EMAIL_PSSWD)
let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PSSWD
    }
}));

function sendEmail(receiver, body, callback){
    let mailOptions = {
        from: process.env.USERNAME + '@gmail.com', // sender address 
        to: receiver, // list of receivers 
        subject: 'Volunteer Matched!', // Subject line 
        html: body // html body 
    };

    transporter.sendMail(mailOptions, function (error, info) {
        // console.log(error,info);
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }

        callback(error, info);
    });

    

}

module.exports={
    sendEmail
}