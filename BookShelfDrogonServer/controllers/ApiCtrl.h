#pragma once
#include <drogon/HttpController.h>

class ApiCtrl : public drogon::HttpController<ApiCtrl>
{
  bool checkIsValidISBN(const std::string&  isbn_str) const;
  bool checkEditPermission(const Json::Value &book,const Json::Value &session) const;
  bool checkExistBook(const Json::Value &book) const;

public:
  METHOD_LIST_BEGIN
  ADD_METHOD_TO(ApiCtrl::getHaveBooks, "/api/get_have_books", drogon::Get);
  ADD_METHOD_TO(ApiCtrl::getUserId, "/api/get_user_id", drogon::Get);
  ADD_METHOD_TO(ApiCtrl::registerBook, "/api/register_book", drogon::Post);
  ADD_METHOD_TO(ApiCtrl::changeReadState, "/api/change_read_state", drogon::Post);
  ADD_METHOD_TO(ApiCtrl::deleteBook, "/api/delete_book", drogon::Post);
  ADD_METHOD_TO(ApiCtrl::getSharedBooks, "/api/get_shared_books/{user_id}", drogon::Post);
  ADD_METHOD_TO(ApiCtrl::getUserNameToId, "/api/get_user_name_to_id/{user_id}", drogon::Post);
  METHOD_LIST_END
  void getHaveBooks(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void getUserId(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void registerBook(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void changeReadState(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void deleteBook(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void getSharedBooks(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback, std::string user_id) const;
  void getUserNameToId(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback, std::string user_id) const;
};
