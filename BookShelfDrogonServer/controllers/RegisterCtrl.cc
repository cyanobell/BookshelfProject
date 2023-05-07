#include "RegisterCtrl.h"
#include "JSON_VALUENAMES.h"

using namespace drogon;
void RegisterCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}

void RegisterCtrl::registerUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  HttpResponsePtr res = HttpResponse::newHttpResponse();
  const auto client_ptr = drogon::app().getDbClient();
  const auto session = req->session();
  if (!client_ptr || !client_ptr->hasAvailableConnections())
  {
    LOG_DEBUG << "DataBase Connect failed";
    res->setStatusCode(k500InternalServerError);
    callback(res);
    return;
  }
  const auto jsonData = req->jsonObject();

  if ((*jsonData)[VALUE::USER::USER_NAME].isNull() || (*jsonData)[VALUE::USER::PASS_WORD].isNull())
  {
    LOG_DEBUG << "empty input";
    res->setStatusCode(k401Unauthorized);
    res->setContentTypeCode(CT_TEXT_PLAIN);
    res->setBody("The name or pass is empty");
    callback(res);
    return;
  }

  std::string name = (*jsonData)[VALUE::USER::USER_NAME].asString();
  std::string pass = (*jsonData)[VALUE::USER::PASS_WORD].asString();

  bool isRecaptchaSuccess = false;
  if (!(*jsonData)["recaptchaResponse"].isNull())
  {
    std::string recaptchaResponse = (*jsonData)["recaptchaResponse"].asString();
  }

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
    const auto result = client_ptr->execSqlSync("SELECT * FROM users WHERE name = $1", name);
    if (result.size() == 1)
    {
      LOG_DEBUG << "register failed: " << name;
      res->setStatusCode(k401Unauthorized);
      res->setContentTypeCode(CT_TEXT_PLAIN);
      res->setBody("The name is already registered");
      callback(res);
      return;
    }
    // todo:パスのハッシュ化
   
    const auto insert_id =  client_ptr->execSqlSync("INSERT INTO users(name, pass) VALUES ($1, $2) RETURNING id", name, pass);
    LOG_DEBUG << "register success: " << name;
    session->clear();
    session->changeSessionIdToClient();
    session->insert(VALUE::SESSION::USER_ID, std::atoi(insert_id.front()["id"].c_str()));
    session->insert(VALUE::SESSION::USER_NAME, name);
    res->setStatusCode(k201Created);
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
