#include "IndexCtrl.h"
using namespace drogon;
void IndexCtrl::asyncHandleHttpRequest(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
  auto res = HttpResponse::newFileResponse(html_filename);
  callback(res);
}