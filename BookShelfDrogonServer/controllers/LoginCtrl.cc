#include "LoginCtrl.h"
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Exception.h>
#include "bcrypt/BCrypt.hpp"
#include "../utilities/reCaptcha.h"
#include "JSON_VALUENAMES.h"

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
  const auto json_data = req->jsonObject();

  if ((*json_data)[VALUE::USER::USER_NAME].isNull() || (*json_data)[VALUE::USER::PASS_WORD].isNull() || (*json_data)[VALUE::USER::PASS_WORD].asString().empty() || (*json_data)[VALUE::USER::PASS_WORD].asString().empty())
  {
    LOG_INFO << "empty input";
    res->setStatusCode(k401Unauthorized);
    res->setContentTypeCode(CT_TEXT_PLAIN);
    res->setBody("The name or pass is empty");
    callback(res);
    return;
  }

  const std::string name = (*json_data)[VALUE::USER::USER_NAME].asString();
  const std::string pass = (*json_data)[VALUE::USER::PASS_WORD].asString();

  bool isRecaptchaSuccess = false;
  if (!(*json_data)["recaptchaToken"].isNull())
  {
    std::string recaptchaToken = (*json_data)["recaptchaToken"].asString();
    isRecaptchaSuccess = utilities::reCaptchaSubmit(recaptchaToken);
  }

  if (!isRecaptchaSuccess)
  {
    res->setStatusCode(k401Unauthorized);
    res->setContentTypeCode(CT_TEXT_PLAIN);
    LOG_INFO << "reCaptchaFailed: " << name;
    res->setBody("reCaptchaFailed");
    callback(res);
    return;
  }
  try
  {
    std::string hashed_pass = BCrypt::generateHash(pass);
    const auto result = client_ptr->execSqlSync("SELECT * FROM users WHERE name = $1", name);
    if (result.size() != 1 || !BCrypt::validatePassword(pass,result.front()[VALUE::USER::PASS_WORD].c_str()))
    {
      LOG_INFO << "login failed: " << name;
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
    session->insert(VALUE::SESSION::USER_ID, std::atoi(result.front()[VALUE::USER::ID].c_str()));
    session->insert(VALUE::SESSION::USER_NAME, std::string(result.front()[VALUE::USER::USER_NAME].c_str()));
    res->setStatusCode(k200OK);
    callback(res);
    return;
  }
  catch (orm::DrogonDbException &e)
  {
    LOG_INFO << "sql error: " << e.base().what();
    res->setStatusCode(k500InternalServerError);
    callback(res);
    return;
  }
}
