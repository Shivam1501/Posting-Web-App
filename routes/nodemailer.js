const nodemailer = require("nodemailer");
const {google} = require("googleapis");

const CLIENT_ID = `787077451724-101ml6200eft1punf80opgeanpkilumb.apps.googleusercontent.com`;

const CLIENT_SECRET = `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`;
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//04Fpo7U2nLbOGCgYIARAAGAQSNwF-L9IrSae2hwXSti72bUYwGrIoG_MQa-yNCDvcdZrWTpOsDtEz9Si1AVOcFqDvWnoPz92QfgE`;

const oauthclient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauthclient.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendMail(receiver, text){ 
  try{
    const access_token = await oauthclient.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user:"patilshivam456@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_token
      }
    })

    const mailOpts = {
      from: "patilshivam456@gmail.com",
      to: receiver,
      subject: "password change",
      text: "hey hey",
      html: text
    }

    const result = transport.sendMail(mailOpts);
    return result;
  }
  catch(err){
    return err;
  }
}

module.exports = sendMail;