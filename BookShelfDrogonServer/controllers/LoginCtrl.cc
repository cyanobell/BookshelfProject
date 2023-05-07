#include <drogon/orm/DbClient.h>
#include "LoginCtrl.h"
#include "JSON_VALUENAMES.h"
#include <drogon/orm/Exception.h>

using namespace drogon;
void LoginCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}

void LoginCtrl::loginUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  HttpResponsePtr res = HttpResponse::newHttpResponse();
  const auto client_ptr = drogon::app().getDbClient();
  if (!client_ptr || !client_ptr->hasAvailableConnections())
  {
    LOG_DEBUG << "DataBase Connect failed";
    res->setStatusCode(k500InternalServerError);
    callback(res);
    return;
  }
  const auto jsonData = req->jsonObject();

  if ((*jsonData)["name"].isNull() || (*jsonData)["pass"].isNull())
  {
    LOG_DEBUG << "empty input";
    res->setStatusCode(k401Unauthorized);
    res->setContentTypeCode(CT_TEXT_PLAIN);
    res->setBody("The name or pass is empty");
    callback(res);
    return;
  }

  std::string name = (*jsonData)["name"].asString();
  std::string pass = (*jsonData)["pass"].asString();

  bool isRecaptchaSuccess = false;

  if (false && !isRecaptchaSuccess)
  { // googleRecaptchaの認証
    res->setStatusCode(k401Unauthorized);
    res->setContentTypeCode(CT_TEXT_PLAIN);
    LOG_DEBUG << "name: " << name;
    res->setBody("reCaptchaFailed");
    callback(res);
    return;
  }
  try
  {
    // todo:ハッシュ化されたパスとの照合
    const auto result = client_ptr->execSqlSync("SELECT * FROM users WHERE name = $1 AND pass = $2", name, pass);
    if (result.size() != 1)
    {
      LOG_DEBUG << "login failed: " << name;
      res->setStatusCode(k401Unauthorized);
      res->setContentTypeCode(CT_TEXT_PLAIN);
      res->setBody("user or password is wrong");
      callback(res);
      return;
    }
    LOG_DEBUG << "login success: " << name;
    const auto session = req->session();
    session->clear();
    session->changeSessionIdToClient();
    session->insert(VALUE::SESSION::USER_ID, std::atoi(result.front()["id"].c_str()));
    session->insert(VALUE::SESSION::USER_NAME, std::string(result.front()["name"].c_str()));
    res->setStatusCode(k200OK);
    callback(res);
    return;
  }
  catch (orm::DrogonDbException &e)
  {
    LOG_DEBUG << "sql error: " << e.base().what();
    res->setStatusCode(k500InternalServerError);
    callback(res);
    return;
  }
}
