#include "LogoutCtrl.h"
#include "SESSION_VALUENAMES.h"

using namespace drogon;
void LogoutCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();

  const auto user_name = session->getOptional<std::string>(VALUE_NAME::USER_NAME);

  LOG_DEBUG << "logout: " << user_name.value_or("undefined");
  session->clear();
  session->changeSessionIdToClient();

  auto res = HttpResponse::newRedirectionResponse("/");
  callback(res);
}
