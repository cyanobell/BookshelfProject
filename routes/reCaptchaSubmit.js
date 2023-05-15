
const fetch = require('node-fetch');
async function verifyCaptcha(secretKey, recaptchaToken) {
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`);
  const responseData = await response.json();
  if (responseData.success && responseData.score >= 0.5) {
    return true;
  } else {
    return false;
  }
}
module.exports = verifyCaptcha;