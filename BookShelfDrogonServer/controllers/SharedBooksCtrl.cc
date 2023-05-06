#include "SharedBooksCtrl.h"
#include "SESSION_VALUENAMES.h"

using namespace drogon;
void SharedBooksCtrl::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, std::string user_id) const
{
  const auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}
