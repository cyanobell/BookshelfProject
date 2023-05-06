#include "HomeCtrl.h"
#include "SESSION_VALUENAMES.h"

using namespace drogon;
void HomeCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  auto session = req->session();

  auto user_id = session->getOptional<int>(VALUE_NAME::USER_ID);
  auto user_name = session->getOptional<std::string>(VALUE_NAME::USER_NAME);

  if (user_id == nullopt || user_name == nullopt)
  { // ログインしていない。
    auto res = HttpResponse::newRedirectionResponse("/");
    callback(res);
    return;
  }

  auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}
