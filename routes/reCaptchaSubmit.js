
const fetch = require('node-fetch');
async function verifyCaptcha(secretKey, captchaResponse) {
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaResponse}`);
  const responseData = await response.json();
  if (responseData.success && responseData.score >= 0.5) {
    console.log('reCAPTCHA verification success');
    return true;
  } else {
    console.log('reCAPTCHA verification failed');
    return false;
  }
}
module.exports = verifyCaptcha;