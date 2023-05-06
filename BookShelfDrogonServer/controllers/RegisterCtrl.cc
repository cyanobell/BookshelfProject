#include "RegisterCtrl.h"
#include "SESSION_VALUENAMES.h"

using namespace drogon;
void RegisterCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}

void RegisterCtrl::fakeRegister(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  HttpResponsePtr res = HttpResponse::newHttpResponse();
  const auto jsonData = req->jsonObject();
  std::string name = (*jsonData)["name"].asString();
  std::string pass = (*jsonData)["pass"].asString();
  // fake register
  if (false)
  {
    LOG_DEBUG << "register failed: " << name;
    res->setContentTypeCode(CT_TEXT_PLAIN);
    res->setBody("The name is already registered.");
    res->setStatusCode(k401Unauthorized);
    callback(res);
    return;
  }
  LOG_DEBUG << "register: " << name;
  const auto session = req->session();
  session->clear();
  session->changeSessionIdToClient();
  session->insert(VALUE_NAME::USER_ID, 3);
  session->insert(VALUE_NAME::USER_NAME, name);
  res->setStatusCode(k201Created);
  callback(res);
} /*
        if (error_detail === '') {
          this.setState({ login_state_text: 'その名前はすでに登録されています' });
        } else if (error_detail === 'captchaFailed') {
          this.setState({ login_state_text: 'reCAPTCHAの認証に失敗しました' });
        } else if (error_detail === 'The name or pass is empty.') {
          this.setState({ login_state_text: 'ユーザー名かパスワードが空です' });
        }*/
