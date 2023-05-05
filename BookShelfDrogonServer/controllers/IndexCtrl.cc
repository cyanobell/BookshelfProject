#include "IndexCtrl.h"
using namespace drogon;
void IndexCtrl::asyncHandleHttpRequest(const HttpRequestPtr& req, std::function<void (const HttpResponsePtr &)> &&callback)
{
    auto resp = HttpResponse::newHttpResponse();  // 新しいレスポンスインスタンスを生成
    resp->setStatusCode(k200OK);            // HTTPステータスコード 200に設定
    resp->setContentTypeCode(CT_TEXT_HTML); // Header: Content typeをHTMLにする
    resp->setBody(html_str); // Body:
    callback(resp);
}