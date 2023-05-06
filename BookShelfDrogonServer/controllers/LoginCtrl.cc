#include "LoginCtrl.h"

using namespace drogon;
// Add definition of your processing function here
void LoginCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  LOG_DEBUG << html_filename;
  auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}

void LoginCtrl::fakeLogin(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  std::string name = req->getParameter("name");
  std::string pass = req->getParameter("pass");
  HttpResponsePtr res = HttpResponse::newHttpResponse();
  LOG_DEBUG << name;
  LOG_DEBUG << pass;
  // fake login
  if (true)
  {
    res->setContentTypeCode(CT_TEXT_PLAIN);
    res->setBody("user or password is wrong");
    res->setStatusCode(k401Unauthorized);
    callback(res);
    return;
  }
  req->session()->insert("user_id", 3);
  req->session()->insert("name", name);
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
