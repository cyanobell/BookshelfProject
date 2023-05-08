#pragma once
#include <drogon/HttpController.h>

class ApiCtrl : public drogon::HttpController<ApiCtrl>
{
  bool strIsNumber(const std::string &str) const{ return str.find_first_not_of("0123456789") == std::string::npos; }
  int charToInt(const char &c) const{ return c - '0'; }

  bool checkExistUserid(const drogon::SessionPtr &session) const;
  bool checkExistUserid(const int user_id) const;
  drogon::HttpResponsePtr newHttpResNotLogined() const;
  drogon::HttpResponsePtr newHttpResUserNotFound() const;

  bool checkEditPermission(const Json::Value &book, const drogon::SessionPtr &session) const;
  drogon::HttpResponsePtr newHttpResNotEditPermission() const;

  bool checkIsValidISBN(const std::string &isbn_str) const;
  drogon::HttpResponsePtr newHttpResISBNNotValid() const;

  bool checkExistBook(const Json::Value &book) const;
  bool checkExistBook(int user_id, std::string isbn) const;
  drogon::HttpResponsePtr newHttpResBookAlreadyExist() const;
  drogon::HttpResponsePtr newHttpResBookNotExist() const;

  Json::Value makeBooksJson(const drogon::orm::Result &orm_books) const;
  Json::Value makeBookJson(const drogon::orm::Row &orm_book) const;
  Json::Value makeBookJson(int id, int user_id, std::string isbn, int read_state) const;

public:
  METHOD_LIST_BEGIN
  ADD_METHOD_TO(ApiCtrl::getHaveBooks, "/api/get_have_books", drogon::Get);
  ADD_METHOD_TO(ApiCtrl::getUserId, "/api/get_user_id", drogon::Get);
  ADD_METHOD_TO(ApiCtrl::registerBook, "/api/register_book", drogon::Post);
  ADD_METHOD_TO(ApiCtrl::changeReadState, "/api/change_read_state", drogon::Post);
  ADD_METHOD_TO(ApiCtrl::deleteBook, "/api/delete_book", drogon::Post);
  ADD_METHOD_TO(ApiCtrl::getSharedBooks, "/api/get_shared_books/{user_id}", drogon::Get);
  ADD_METHOD_TO(ApiCtrl::getUserNameToId, "/api/get_user_name_to_id/{user_id}", drogon::Get);
  METHOD_LIST_END
  void getHaveBooks(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void getUserId(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void registerBook(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void changeReadState(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void deleteBook(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void getSharedBooks(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback, std::string user_id_str) const;
  void getUserNameToId(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback, std::string user_id_str) const;
};
