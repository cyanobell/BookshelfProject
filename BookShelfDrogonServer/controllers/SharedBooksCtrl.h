#pragma once
#include <drogon/HttpController.h>
#include <string>

class SharedBooksCtrl : public drogon::HttpController<SharedBooksCtrl>
{
  constexpr static const char *html_filename = "../../bookshelf_app/readOnly.html";
public:
  METHOD_LIST_BEGIN
  METHOD_ADD(SharedBooksCtrl::get, "shared_books/{user_id}", drogon::Get);
  METHOD_LIST_END
  void get(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback, std::string user_id) const;
};
