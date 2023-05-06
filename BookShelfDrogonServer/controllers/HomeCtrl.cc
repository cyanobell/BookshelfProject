#include "HomeCtrl.h"
#include "SESSION_VALUENAMES.h"

using namespace drogon;
void HomeCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();


  const bool user_id_exist = session->find(VALUE_NAME::USER_ID);
  const bool user_name_exist = session->find(VALUE_NAME::USER_NAME);
  if (!user_id_exist || !user_name_exist)
  { // ログインしていない。
    const auto res = HttpResponse::newRedirectionResponse("/");
    callback(res);
    return;
  }
  const auto user_id = session->get<int>(VALUE_NAME::USER_ID);
  const auto user_name = session->get<std::string>(VALUE_NAME::USER_NAME);

  const auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}
