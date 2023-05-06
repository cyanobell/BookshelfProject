#pragma once
#include <drogon/HttpSimpleController.h>

class LogoutCtrl : public drogon::HttpSimpleController<LogoutCtrl>
{
  constexpr static const char *html_filename = "../../bookshelf_app/home.html";
public:
  virtual void asyncHandleHttpRequest(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback);

  PATH_LIST_BEGIN
  PATH_ADD("/logout", drogon::Get);
  PATH_LIST_END
};