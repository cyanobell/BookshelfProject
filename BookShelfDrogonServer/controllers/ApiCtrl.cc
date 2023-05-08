#include "ApiCtrl.h"
#include "JSON_VALUENAMES.h"

using namespace drogon;

bool ApiCtrl::checkExistUserid(const SessionPtr &session) const
{
  return session->find(VALUE::SESSION::USER_ID) && checkExistUserid(session->get<int>(VALUE::SESSION::USER_ID));
}

bool ApiCtrl::checkExistUserid(int user_id) const
{
  const auto client_ptr = app().getDbClient();
  const auto result = client_ptr->execSqlSync("SELECT * FROM users WHERE id = $1 LIMIT 1",
                                              user_id);
  return result.size() > 0;
}

HttpResponsePtr ApiCtrl::newHttpResNotLogined() const
{
  LOG_INFO << "not login user trying operate";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k401Unauthorized);
  res->setBody("user is not logined");
  return res;
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

bool ApiCtrl::checkEditPermission(const Json::Value &book, const SessionPtr &session) const
{
  return book[VALUE::BOOK::USER_ID] == session->get<int>(VALUE::SESSION::USER_ID);
}

HttpResponsePtr ApiCtrl::newHttpResNotEditPermission() const
{
  LOG_INFO << "user trying edit not permission book";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k401Unauthorized);
  return res;
}

// 現状古い規格は非対応
bool ApiCtrl::checkIsValidISBN(const std::string &isbn_str) const
{
  // 書式チェック。数字の長さと、文字が含まれていないか。
  if (isbn_str.length() != 13 || !strIsNumber(isbn_str))
  {
    return false;
  }
  // 現状古い規格は非対応　数字の先頭をチェック
  if (isbn_str[0] != '9' && isbn_str[1] != '7')
  {
    return false;
  }
  const int check_digit = std::stoi(isbn_str.substr(isbn_str.length() - 1, 1)); // バーコードからチェックディジットを抽出する
  std::vector<char> barcode_digits(isbn_str.begin(), isbn_str.end() - 1); // チェックディジットを除いたバーコードの桁を抽出する

  // チェックデジットと照らし合わせる数字を生成
  int sum = 0;
  for (int i = 0; i < barcode_digits.size(); i++)
  {
    if (i % 2 == 0)
    {
      sum += charToInt(barcode_digits[i]); // 奇数桁を足す
    }
    else
    {
      sum += charToInt(barcode_digits[i]) * 3; // 偶数桁を3倍して足す
    }
  }

  // チェックデジットと照らし合わせる
  if ((sum + check_digit) % 10 == 0)
  {
    return true;
  }
  else
  {
    LOG_INFO << "Barcode error| sum: " << sum << " check_digit: " << check_digit;
    return false;
  }
}

HttpResponsePtr ApiCtrl::newHttpResISBNNotValid() const
{
  LOG_INFO << "tryed operate. but isbn is not valid";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k400BadRequest);
  res->setContentTypeCode(CT_TEXT_PLAIN);
  res->setBody("isbn is too old or wrong");
  return res;
}

bool ApiCtrl::checkExistBook(const Json::Value &book) const
{
  return checkExistBook(book[VALUE::BOOK::USER_ID].asInt(), book[VALUE::BOOK::ISBN].asString());
}

bool ApiCtrl::checkExistBook(int user_id, std::string isbn) const
{
  const auto client_ptr = app().getDbClient();
  const auto result = client_ptr->execSqlSync("SELECT * FROM books WHERE user_id = $1 AND isbn = $2 LIMIT 1",
                                              user_id, isbn);
  return result.size() > 0;
}

HttpResponsePtr ApiCtrl::newHttpResBookAlreadyExist() const
{
  LOG_INFO << "tryed operate. but book is already exist";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k409Conflict);
  res->setContentTypeCode(CT_TEXT_PLAIN);
  return res;
}

HttpResponsePtr ApiCtrl::newHttpResBookNotExist() const
{
  LOG_INFO << "tryed operate. but book is not exist";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k400BadRequest);
  res->setContentTypeCode(CT_TEXT_PLAIN);
  res->setBody("book is not exist");
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

void ApiCtrl::getHaveBooks(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();
  const auto client_ptr = app().getDbClient();

  if (!checkExistUserid(session))
  {
    callback(newHttpResNotLogined());
    return;
  }
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

  if (!checkExistUserid(session))
  {
    callback(newHttpResNotLogined());
    return;
  }

  Json::Value result;
  result["user_id"] = session->get<int>(VALUE::SESSION::USER_ID);
  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k200OK);
  callback(res);
}

void ApiCtrl::registerBook(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();

  if (!checkExistUserid(session))
  {
    callback(newHttpResNotLogined());
    return;
  }

  const auto json_data = req->jsonObject();
  if ((*json_data)[VALUE::BOOK::ISBN].isNull() || !checkIsValidISBN((*json_data)[VALUE::BOOK::ISBN].asString()))
  {
    callback(newHttpResISBNNotValid());
    return;
  }

  const int user_id = session->get<int>(VALUE::SESSION::USER_ID);
  const std::string isbn = (*json_data)[VALUE::BOOK::ISBN].asString();

  if (checkExistBook(user_id, isbn))
  {
    callback(newHttpResBookAlreadyExist());
    return;
  }

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

  if (!checkExistUserid(session))
  {
    callback(newHttpResNotLogined());
    return;
  }

  const auto json_data = req->jsonObject();
  const Json::Value book = (*json_data)[VALUE::BOOK::BOOK];
  const int new_read_state = (*json_data)[VALUE::BOOK::NEW_READ_STATE].asInt();
  if (!checkEditPermission(book, session))
  {
    callback(newHttpResNotEditPermission());
    return;
  }

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

  if (!checkExistUserid(session))
  {
    callback(newHttpResNotLogined());
    return;
  }

  const auto json_data = req->jsonObject();
  const Json::Value book = (*json_data)[VALUE::BOOK::BOOK];
  if (!checkEditPermission(book, session))
  {
    callback(newHttpResNotEditPermission());
    return;
  }

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

void ApiCtrl::getSharedBooks(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, std::string user_id_str) const
{
  if (!strIsNumber(user_id_str))
  {
    callback(newHttpResUserNotFound());
  }

  int user_id = std::stoi(user_id_str);
  if (!checkExistUserid(user_id))
  {
    callback(newHttpResUserNotFound());
    return;
  }

  const auto client_ptr = app().getDbClient();
  const auto orm_books =
      client_ptr->execSqlSync("SELECT * FROM books WHERE user_id = $1",
                              user_id);

  Json::Value result = makeBooksJson(orm_books);
  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k200OK);
  callback(res);
}

void ApiCtrl::getUserNameToId(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, std::string user_id_str) const
{

  if (!strIsNumber(user_id_str))
  {
    callback(newHttpResUserNotFound());
  }

  int user_id = std::stoi(user_id_str);
  if (!checkExistUserid(user_id))
  {
    callback(newHttpResUserNotFound());
    return;
  }

  const auto client_ptr = app().getDbClient();
  const auto user =
      client_ptr->execSqlSync("SELECT * FROM users WHERE id = $1",
                              user_id);
  Json::Value result;
  result["user_name"] = user.front()[VALUE::USER::USER_NAME].c_str();
  auto res = HttpResponse::newHttpJsonResponse(result);
  res->setStatusCode(k200OK);
  callback(res);
}
