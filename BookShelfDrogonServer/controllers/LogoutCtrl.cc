#include "LogoutCtrl.h"
#include "SESSION_VALUENAMES.h"

using namespace drogon;
void LogoutCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  auto session = req->session();

  auto user_name = session->getOptional<std::string>(VALUE_NAME::USER_NAME);

  LOG_DEBUG << "logout: " << user_name.value_or("undefined");
  req->session()->erase(VALUE_NAME::USER_ID);
  req->session()->erase(VALUE_NAME::USER_NAME);

  auto res = HttpResponse::newRedirectionResponse("/");
  callback(res);
}
