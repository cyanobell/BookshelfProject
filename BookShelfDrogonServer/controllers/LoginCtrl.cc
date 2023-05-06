#include "LoginCtrl.h"
#include "SESSION_VALUENAMES.h"

using namespace drogon;
void LoginCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}

void LoginCtrl::fakeLogin(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  HttpResponsePtr res = HttpResponse::newHttpResponse();
  auto jsonData = req->jsonObject();
  std::string name = (*jsonData)["name"].asString();
  std::string pass = (*jsonData)["pass"].asString();
  LOG_DEBUG << "name: " << name;
  LOG_DEBUG << "pass: " << pass;
  // fake login
  if (false)
  {
    res->setContentTypeCode(CT_TEXT_PLAIN);
    res->setBody("user or password is wrong");
    res->setStatusCode(k401Unauthorized);
    callback(res);
    return;
  }
  req->session()->insert(VALUE_NAME::USER_ID, 3);
  req->session()->insert(VALUE_NAME::USER_NAME, name);
  res->setStatusCode(k200OK);
  callback(res);
} /*
         if (json.text === 'user or password is wrong') {
           this.setState({
             login_state_text: 'ログインに失敗しました'
           });
         } else if (json.text === 'captchaFailed') {
           this.setState({
             login_state_text: 'reCAPTCHAの認証に失敗しました'
           });
         } else if (json.text === 'The name or pass is empty.') {*/
