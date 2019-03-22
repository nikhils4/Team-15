var nodemailer = require('nodemailer');
var config = require("./config"); //done

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'eciproje425@gmail.com',
        pass: config.password
    }
});

var mailOptions = {
    from: 'eciproje425@gmail.com',
    to: 'nikhilsingh498@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy! You are Nikhil right :)'
};

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});