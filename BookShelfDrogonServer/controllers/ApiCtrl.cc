#include "ApiCtrl.h"
#include "JSON_VALUENAMES.h"
#include "../utilities/misc.h"
#include "bcrypt/BCrypt.hpp"
#include <string>
#include <fstream>

using namespace drogon;

bool ApiCtrl::checkExistUserid(int user_id) const
{
  const auto client_ptr = app().getDbClient();
  const auto result = client_ptr->execSqlSync("SELECT * FROM users WHERE id = $1 LIMIT 1",
                                              user_id);
  return result.size() > 0;
}

HttpResponsePtr ApiCtrl::newHttpResUserNotFound() const
{
  LOG_INFO << "user id is not found";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k404NotFound);
  res->setContentTypeCode(CT_TEXT_PLAIN);
  res->setBody("user id is not found");
  return res;
}

Json::Value ApiCtrl::makeBookJson(const orm::Row &orm_book) const
{
  Json::Value book;
  book[VALUE::BOOK::ID] = std::atoi(orm_book[VALUE::BOOK::ID].c_str());
  book[VALUE::BOOK::USER_ID] = std::atoi(orm_book[VALUE::BOOK::USER_ID].c_str());
  book[VALUE::BOOK::ISBN] = std::string(orm_book[VALUE::BOOK::ISBN].c_str());
  book[VALUE::BOOK::READ_STATE] = std::atoi(orm_book[VALUE::BOOK::READ_STATE].c_str());
  return book;
}

Json::Value ApiCtrl::makeBookJson(int id, int user_id, std::string isbn, int read_state) const
{
  Json::Value book;
  book[VALUE::BOOK::ID] = id;
  book[VALUE::BOOK::USER_ID] = user_id;
  book[VALUE::BOOK::ISBN] = isbn;
  book[VALUE::BOOK::READ_STATE] = read_state;
  return book;
}

Json::Value ApiCtrl::makeBooksJson(const orm::Result &orm_books) const
{
  Json::Value books;
  books.resize(orm_books.size());
  int i = 0;
  for (auto &orm_book : orm_books)
  {
    books[i] = makeBookJson(orm_book);
    i++;
  }
  return books;
}

std::optional<drogon::orm::Row> ApiCtrl::getUserToShareingId(const std::string &user_shareing_id) const
{
  const auto client_ptr = app().getDbClient();
  const auto users = client_ptr->execSqlSync("SELECT * FROM users WHERE shareing_seed = $1",user_shareing_id);
  return users.size() != 0 ? std::optional<drogon::orm::Row>(users.front()) : std::nullopt;
}

void ApiCtrl::getHaveBooks(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();
  const auto client_ptr = app().getDbClient();

  const auto orm_books =
      client_ptr->execSqlSync("SELECT * FROM books WHERE user_id = $1",
                              session->get<int>(VALUE::SESSION::USER_ID));

  Json::Value result = makeBooksJson(orm_books);
  auto res = HttpResponse::newHttpJsonResponse(result);
  callback(res);
}

void ApiCtrl::getUserId(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();

  Json::Value result;
  result["user_id"] = session->get<int>(VALUE::SESSION::USER_ID);
  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k200OK);
  callback(res);
}

void ApiCtrl::getUserShareingId(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();
  const auto client_ptr = app().getDbClient();

  const auto orm_users =
      client_ptr->execSqlSync("SELECT * FROM users WHERE id = $1",
                              session->get<int>(VALUE::SESSION::USER_ID));
  Json::Value result;
  result["user_shareing_id"] = orm_users.front()[VALUE::USER::SHAREING_SEED].c_str();
  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k200OK);
  callback(res);
}

void ApiCtrl::registerBook(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();
  const auto json_data = req->jsonObject();
  const int user_id = session->get<int>(VALUE::SESSION::USER_ID);
  const std::string isbn = (*json_data)[VALUE::BOOK::ISBN].asString();

  const auto client_ptr = app().getDbClient();
  const auto insert_id =
      client_ptr->execSqlSync("INSERT INTO books(user_id, isbn, read_state) VALUES ($1, $2, $3) RETURNING id",
                              user_id, isbn, 0);
  const int id = std::atoi(insert_id.front()["id"].c_str());

  Json::Value result = makeBookJson(id, user_id, isbn, 0);

  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k201Created);
  callback(res);
}

void ApiCtrl::changeReadState(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();

  const auto json_data = req->jsonObject();
  const Json::Value book = (*json_data)[VALUE::BOOK::BOOK];
  const int new_read_state = (*json_data)[VALUE::BOOK::NEW_READ_STATE].asInt();

  const auto client_ptr = app().getDbClient();
  client_ptr->execSqlAsync(
      "UPDATE books SET read_state = $1 WHERE id = $2",
      [](const orm::Result &result) {}, [](const orm::DrogonDbException &e)
      { throw e; },
      new_read_state, book[VALUE::BOOK::ID].asInt());

  Json::Value result;

  result[VALUE::BOOK::BOOK] = makeBookJson(
      book[VALUE::BOOK::ID].asInt(),
      book[VALUE::BOOK::USER_ID].asInt(),
      book[VALUE::BOOK::ISBN].asString(),
      new_read_state);

  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k202Accepted);
  callback(res);
}

void ApiCtrl::deleteBook(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();

  const auto json_data = req->jsonObject();
  const Json::Value book = (*json_data)[VALUE::BOOK::BOOK];
  const auto client_ptr = app().getDbClient();
  client_ptr->execSqlAsync(
      "DELETE FROM books WHERE id = $1",
      [](const orm::Result &result) {}, [](const orm::DrogonDbException &e)
      { throw e; },
      book[VALUE::BOOK::ID].asInt());

  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k202Accepted);
  callback(res);
}

void ApiCtrl::getSharedBooksToShareingId(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, std::string user_shareing_id) const
{
  const auto user_orm = getUserToShareingId(user_shareing_id);
  if (!user_orm)
  {
    callback(newHttpResUserNotFound());
    return;
  }
  const auto client_ptr = app().getDbClient();
  const auto orm_books =
      client_ptr->execSqlSync("SELECT * FROM books WHERE user_id = $1", (*user_orm)[VALUE::USER::ID].c_str());

  Json::Value result = makeBooksJson(orm_books);
  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k200OK);
  callback(res);
}

void ApiCtrl::getUserNameToShareingId(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, std::string user_shareing_id) const
{
  const auto client_ptr = app().getDbClient();
  const auto user_orm = getUserToShareingId(user_shareing_id);

  if (!user_orm)
  {
    callback(newHttpResUserNotFound());
    return;
  }
  
  std::string user_name = (*user_orm)[VALUE::USER::USER_NAME].c_str();
  Json::Value result;
  result["user_name"] = user_name;
  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k200OK);
  callback(res);
}
