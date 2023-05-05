#pragma once
#include <drogon/HttpSimpleController.h>
#include "../utils/Html.h"
#include "string"

class IndexCtrl : public drogon::HttpSimpleController<IndexCtrl>
{
    std::string html_str;
  public:
    IndexCtrl():
      drogon::HttpSimpleController<IndexCtrl>(),
      html_str(util::Html("index.html")){}
    
    virtual void asyncHandleHttpRequest(const drogon::HttpRequestPtr &req,std::function<void(const drogon::HttpResponsePtr &)> &&callback);
    PATH_LIST_BEGIN
    PATH_ADD("/", drogon::Get);  // ルーティング
    PATH_LIST_END
};
