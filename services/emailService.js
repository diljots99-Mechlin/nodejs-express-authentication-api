import NodeMailer from "nodemailer";

console.log("smtpConfig: ", process.env.SMTP_HOST);

export const sendConfirmationEmail = (
  name,
  email,
  confirmationCode,
  req,
  res
) => {
  const smtpConfig = {
    //   pool: true,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // use TLS
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  };
  const smtpTransport = NodeMailer.createTransport(smtpConfig);
  console.log("smtpConfig: ", smtpConfig);
  console.log("smtpConfig: ", process.env.SMTP_HOST);
  smtpTransport
    .sendMail({
      from: "diljots99.diljotsingh@gmail.com",
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:8081/confirm/${confirmationCode}> Click here</a>
          </div>`,
    })
    .then((info) => {
      console.log("Preview URL: " + NodeMailer.getTestMessageUrl(info));
    })
    .catch((err) => {
      console.error(err);
      console.log(err);
    });
};
