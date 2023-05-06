#pragma once
#include <drogon/HttpController.h>

class HomeCtrl : public drogon::HttpController<HomeCtrl>
{
  constexpr static const char *html_filename = "../../bookshelf_app/home.html";
public:
  HomeCtrl() : drogon::HttpController<HomeCtrl>()
  {}

  METHOD_LIST_BEGIN
  ADD_METHOD_TO(HomeCtrl::get,"/home", drogon::Get);
  METHOD_LIST_END

  void get(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback)const;
};