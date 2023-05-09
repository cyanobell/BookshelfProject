#include <json/value.h>
#include <drogon/drogon.h>
#include <drogon/HttpClient.h>
#include <string>

namespace utilities
{
  inline bool reCaptchaSubmit(const std::string &recaptcha_token)
  {
    const std::string secret_key = drogon::app().getCustomConfig()["googleReCaptchaSecretkey"].asString();

    const auto client = drogon::HttpClient::newHttpClient("https://www.google.com");
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(drogon::Get);
    req->setPath("/recaptcha/api/siteverify");
    req->setParameter("secret", secret_key);
    req->setParameter("response", recaptcha_token);

    std::promise<bool> promise;
    client->sendRequest(req, [&promise](drogon::ReqResult result, const drogon::HttpResponsePtr &response)
                        {
      const auto submit_result = response->jsonObject();
      if(!submit_result->empty()){
        if ((*submit_result)["success"].isNull() || (*submit_result)["success"].asBool() == false) {
          LOG_INFO << "captcha verification is failed.";
          promise.set_value(false);
        }
        promise.set_value(true);
      }else{
        LOG_INFO << "reCaptcha response json parse failed.";
          promise.set_value(false);
      } });
    return promise.get_future().get();
  }
}
