#include "LogoutCtrl.h"
#include "JSON_VALUENAMES.h"

using namespace drogon;
void LogoutCtrl::asyncHandleHttpRequest(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
  const auto session = req->session();

  const auto user_name = session->getOptional<std::string>(VALUE::SESSION::USER_NAME);

  LOG_DEBUG << "logout: " << user_name.value_or("undefined");
  session->clear();
  session->changeSessionIdToClient();

  auto res = HttpResponse::newRedirectionResponse("/");
  callback(res);
}
