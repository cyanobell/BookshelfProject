#include "RegisterCtrl.h"
#include "bcrypt/BCrypt.hpp"
#include "../utilities/reCaptcha.h"
#include "JSON_VALUENAMES.h"
#include <chrono>

using namespace drogon;

bool RegisterCtrl::checkExistUserShareingSeed(const std::string &shareing_seed) const
{
  const auto client_ptr = app().getDbClient();
  const auto result = client_ptr->execSqlSync("SELECT * FROM users WHERE shareing_seed = $1 LIMIT 1",
                                              shareing_seed);
  return result.size() > 0;
}

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

  if ((name.length() < NAME_MIN_LENGTH || name.length() > NAME_MAX_LENGTH) 
    || (pass.length() < PASS_MIN_LENGTH || pass.length() > PASS_MAX_LENGTH))
  {
    LOG_INFO << "input is wrong format";
    res->setStatusCode(k401Unauthorized);
    res->setContentTypeCode(CT_TEXT_PLAIN);
    res->setBody("input is wrong format");
    callback(res);
    return;
  }

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
    const auto result = client_ptr->execSqlSync("SELECT * FROM users WHERE name = $1", name);
    if (result.size() == 1)
    {
      LOG_INFO << "register failed: " << name;
      res->setStatusCode(k409Conflict);
      res->setContentTypeCode(CT_TEXT_PLAIN);
      res->setBody("The name is already registered");
      callback(res);
      return;
    }

    std::string hashed_pass = BCrypt::generateHash(pass);
    std::string shareing_seed;
    constexpr static const int BCRYPT_HEADDER = 7;
    do
    {
      auto now = std::chrono::system_clock::now();
      auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
      shareing_seed = BCrypt::generateHash(pass + name + std::to_string(ms));
      std::replace(shareing_seed.begin(), shareing_seed.end(), '/', '-');
      shareing_seed = shareing_seed.substr(BCRYPT_HEADDER);
    } while (checkExistUserShareingSeed(shareing_seed));

    const auto insert_id = client_ptr->execSqlSync("INSERT INTO users(name, pass, shareing_seed) VALUES ($1, $2, $3) RETURNING id", name, hashed_pass, shareing_seed);
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
    LOG_INFO << "sql error: " << e.base().what();
    res->setStatusCode(k500InternalServerError);
    callback(res);
    return;
  }
}
