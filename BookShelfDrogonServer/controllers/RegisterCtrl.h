#pragma once
#include <drogon/HttpController.h>

class RegisterCtrl : public drogon::HttpController<RegisterCtrl>
{
  constexpr static const char *html_filename = "../../bookshelf_app/register.html";
public:
  RegisterCtrl() : drogon::HttpController<RegisterCtrl>()
  {}

  METHOD_LIST_BEGIN
  ADD_METHOD_TO(RegisterCtrl::get,"/register", drogon::Get);
  ADD_METHOD_TO(RegisterCtrl::fakeRegister,"/register", drogon::Post);
  METHOD_LIST_END

  void get(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback)const;
  void fakeRegister(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback)const;
};

