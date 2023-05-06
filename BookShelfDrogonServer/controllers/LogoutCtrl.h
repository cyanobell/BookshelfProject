#pragma once
#include <drogon/HttpController.h>

class LogoutCtrl : public drogon::HttpController<LogoutCtrl>
{
  constexpr static const char *html_filename = "../../bookshelf_app/home.html";
public:
  LogoutCtrl() : drogon::HttpController<LogoutCtrl>()
  {}

  METHOD_LIST_BEGIN
  ADD_METHOD_TO(LogoutCtrl::get,"/logout", drogon::Get);
  METHOD_LIST_END

  void get(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback)const;
};