#include "HomeCtrl.h"
#include "JSON_VALUENAMES.h"

using namespace drogon;
void HomeCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();

  const bool user_id_exist = session->find(VALUE::SESSION::USER_ID);
  const bool user_name_exist = session->find(VALUE::SESSION::USER_NAME);
  if (!user_id_exist || !user_name_exist)
  { // ログインしていない。
    const auto res = HttpResponse::newRedirectionResponse("/");
    callback(res);
    return;
  }

  const auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}
