#include "ApiCtrl.h"
#include "JSON_VALUENAMES.h"

using namespace drogon;

// 現状古い規格は非対応
bool ApiCtrl::checkIsValidISBN(const std::string &isbn_str) const
{
  // 書式チェック。数字の長さと、
  if (isbn_str.length() != 13 || isbn_str.find_first_not_of("0123456789") != std::string::npos)
  {
    return false;
  }
  // 現状古い規格は非対応　数字の先頭をチェック
  if (isbn_str[0] != '9' && isbn_str[1] != '7')
  {
    return false;
  }
  const int check_digit = std::stoi(isbn_str.substr(isbn_str.length() - 1, 1)); // バーコードからチェックディジットを抽出する
  const std::string barcode_digits = isbn_str.substr(0, isbn_str.length() - 1); // チェックディジットを除いたバーコードの桁を抽出する

  // チェックデジットと照らし合わせる数字を生成
  int sum = 0;
  for (int i = 0; i < barcode_digits.size(); i++)
  {
    if (i % 2 == 0)
    {
      sum += std::atoi(&barcode_digits[i]); // 奇数桁を足す
    }
    else
    {
      sum += std::atoi(&barcode_digits[i]); // 偶数桁を3倍して足す
    }
  }

  // チェックデジットと照らし合わせる
  if ((sum + check_digit) % 10 == 0)
  {
    return true;
  }
  else
  {
    std::cout << "Barcode error: " << sum << check_digit << std::endl;
    return false;
  }
}

bool ApiCtrl::checkEditPermission(const Json::Value &book, const Json::Value &session) const
{
  return book[VALUE::BOOK::USER_ID] == session[VALUE::SESSION::USER_ID];
}

bool ApiCtrl::checkExistBook(const Json::Value &book) const
{
  const auto client_ptr = drogon::app().getDbClient();
  const auto result = client_ptr->execSqlSync("SELECT * FROM books WHERE id = $1 AND user_id = $2 AND isbn = $3 AND read_state = $4 LIMIT 1",
                                              book[VALUE::BOOK::ID],
                                              book[VALUE::BOOK::ISBN],
                                              book[VALUE::BOOK::READ_STATE],
                                              book[VALUE::BOOK::USER_ID]);
  return result.size() > 0;
}

void ApiCtrl::getHaveBooks(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  const auto session = req->session();
  const auto client_ptr = drogon::app().getDbClient();
  const bool user_id_exist = session->find(VALUE::SESSION::USER_ID);
  if (!user_id_exist)
  {
    LOG_DEBUG << "not login user tried to change read state";
    return;
  }
  const auto orm_books = client_ptr->execSqlSync("SELECT * FROM books WHERE user_id = $1",
                                                 session->get<int>(VALUE::SESSION::USER_ID));
  Json::Value result;
  result.resize(orm_books.size());

  int i = 0;
  for (auto &orm_book : orm_books)
  {
    Json::Value book;
    book[VALUE::BOOK::ID] = std::atoi(orm_book[VALUE::BOOK::ID].c_str());
    book[VALUE::BOOK::USER_ID] = std::atoi(orm_book[VALUE::BOOK::USER_ID].c_str());
    book[VALUE::BOOK::ISBN] = std::string(orm_book[VALUE::BOOK::ISBN].c_str());
    book[VALUE::BOOK::READ_STATE] = std::atoi(orm_book[VALUE::BOOK::READ_STATE].c_str());
    result[i] = book;
    i++;
  }

  auto res = HttpResponse::newHttpJsonResponse(result);
  callback(res);
}

void ApiCtrl::getUserId(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  Json::Value result;
  auto res = HttpResponse::newHttpJsonResponse(result);
  callback(res);
}

void ApiCtrl::registerBook(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  Json::Value result;
  auto res = HttpResponse::newHttpJsonResponse(result);
  callback(res);
}

void ApiCtrl::changeReadState(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  Json::Value result;
  auto res = HttpResponse::newHttpJsonResponse(result);
  callback(res);
}

void ApiCtrl::deleteBook(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
  Json::Value result;
  auto res = HttpResponse::newHttpJsonResponse(result);
  callback(res);
}

void ApiCtrl::getSharedBooks(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, std::string user_id) const
{
  Json::Value result;
  auto res = HttpResponse::newHttpJsonResponse(result);
  callback(res);
}

void ApiCtrl::getUserNameToId(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, std::string user_id) const
{
  Json::Value result;
  auto res = HttpResponse::newHttpJsonResponse(result);
  callback(res);
}
