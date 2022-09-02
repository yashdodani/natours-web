const nodemailer = require('nodemailer');

// Here we use mailtrap for development, it does not send email to real address but shares, how it may look like in mailboxes

const sendEmail = async (options) => {
  // 1) Create a transporter (a service like gmail)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option (gmail is not a good idea for sending emails (500 max sending per day, quickly marked as spammer))
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Yash Dodani <yashdodani@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
