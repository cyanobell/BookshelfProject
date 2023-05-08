#include "IndexCtrl.h"
using namespace drogon;
void IndexCtrl::asyncHandleHttpRequest(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
  auto res = HttpResponse::newFileResponse(html_filename);
  const auto client_ptr = drogon::app().getDbClient();
  if (!client_ptr || !client_ptr->hasAvailableConnections())
  {//todo:この処理を適切な位置に移動する。
    LOG_INFO << "DataBase Connect failed";
    res->setStatusCode(k503ServiceUnavailable);
    return;
  }

  callback(res);
}