#pragma once
#include <drogon/HttpSimpleController.h>

class IndexCtrl : public drogon::HttpSimpleController<IndexCtrl>
{
  constexpr static const char *html_filename = "../../bookshelf_app/index.html";
public:
  virtual void asyncHandleHttpRequest(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback);

  PATH_LIST_BEGIN
  PATH_ADD("/", drogon::Get);
  PATH_LIST_END
};
