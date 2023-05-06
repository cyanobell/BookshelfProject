#pragma once
#include <drogon/HttpController.h>

class LoginCtrl : public drogon::HttpController<LoginCtrl>
{
  constexpr static const char *html_filename = "../../bookshelf_app/login.html";
public:
  METHOD_LIST_BEGIN
  ADD_METHOD_TO(LoginCtrl::get,"/login", drogon::Get);
  ADD_METHOD_TO(LoginCtrl::fakeLogin,"/login", drogon::Post);
  METHOD_LIST_END

  void get(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback)const;
  void fakeLogin(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback)const;
};
