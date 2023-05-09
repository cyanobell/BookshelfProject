/**
 *
 *  BookEditPermissionFilter.cc
 *
 */

#include "api_BookFilters.h"
#include <drogon/drogon.h>
#include "../controllers/JSON_VALUENAMES.h"
#include "../utilities/misc.h"

using namespace drogon;
using namespace api;

bool BookEditPermissionFilter::checkEditPermission(const Json::Value &book, const drogon::SessionPtr &session)
{
  return book[VALUE::BOOK::USER_ID] == session->get<int>(VALUE::SESSION::USER_ID);
}

void BookEditPermissionFilter::doFilter(const HttpRequestPtr &req,
                                        FilterCallback &&fcb,
                                        FilterChainCallback &&fccb)
{
  const auto session = req->session();

  const auto json_data = req->jsonObject();
  const Json::Value book = (*json_data)[VALUE::BOOK::BOOK];
  if (checkEditPermission(book, session))
  {
    fccb();
    return;
  }

  LOG_INFO << "user trying edit not permission book";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k401Unauthorized);
  fcb(res);
}

/**
 *
 *  IsbnCodeFilter.cc
 *
 */

using namespace drogon;
using namespace api;

bool IsbnCodeFilter::checkIsValidISBN(const std::string &isbn_str)
{
  // 書式チェック。数字の長さと、文字が含まれていないか。
  if (isbn_str.length() != 13 || !utilities::strIsNumber(isbn_str))
  {
    return false;
  }
  // 現状古い規格は非対応　数字の先頭をチェック
  if (isbn_str[0] != '9' || isbn_str[1] != '7')
  {
    return false;
  }
  const int check_digit = std::stoi(isbn_str.substr(isbn_str.length() - 1, 1)); // バーコードからチェックディジットを抽出する
  std::vector<char> barcode_digits(isbn_str.begin(), isbn_str.end() - 1);       // チェックディジットを除いたバーコードの桁を抽出する

  // チェックデジットと照らし合わせる数字を生成
  int sum = 0;
  for (int i = 0; i < barcode_digits.size(); i++)
  {
    if (i % 2 == 0)
    {
      sum += utilities::charToInt(barcode_digits[i]); // 奇数桁を足す
    }
    else
    {
      sum += utilities::charToInt(barcode_digits[i]) * 3; // 偶数桁を3倍して足す
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

void IsbnCodeFilter::doFilter(const HttpRequestPtr &req,
                              FilterCallback &&fcb,
                              FilterChainCallback &&fccb)
{
  const auto session = req->session();
  const auto json_data = req->jsonObject();
  const std::string isbn = (*json_data)[VALUE::BOOK::ISBN].asString();
  if (checkIsValidISBN(isbn))
  {
    fccb();
    return;
  }

  LOG_INFO << "tryed operate. but isbn is not valid";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k400BadRequest);
  res->setContentTypeCode(CT_TEXT_PLAIN);
  res->setBody("isbn is too old or wrong");
  fcb(res);
}

/**
 *
 *  IsbnAlreadyExistFilter.cc
 *
 */

bool BookExist::checkExistBook(const Json::Value &book)
{
  return checkExistIsbn(book[VALUE::BOOK::USER_ID].asInt(), book[VALUE::BOOK::ISBN].asString());
}

bool BookExist::checkExistIsbn(int user_id, std::string isbn)
{
  const auto client_ptr = app().getDbClient();
  const auto result = client_ptr->execSqlSync("SELECT * FROM books WHERE user_id = $1 AND isbn = $2 LIMIT 1",
                                              user_id, isbn);
  return result.size() > 0;
}

void IsbnAlreadyExistFilter::doFilter(const HttpRequestPtr &req,
                                FilterCallback &&fcb,
                                FilterChainCallback &&fccb)
{
  const auto session = req->session();

  const auto json_data = req->jsonObject();
  const std::string isbn = (*json_data)[VALUE::BOOK::ISBN].asString();
  if (!BookExist::checkExistIsbn(session->get<int>(VALUE::SESSION::USER_ID), isbn))
  {
    fccb();
    return;
  }
  LOG_INFO << "tryed operate. but book is already exist";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k409Conflict);
  res->setContentTypeCode(CT_TEXT_PLAIN);
  res->setBody("book is already exist");
  fcb(res);
}

/**
 *
 *  BookNotExistFilter.cc
 *
 */

void BookNotExistFilter::doFilter(const HttpRequestPtr &req,
                            FilterCallback &&fcb,
                            FilterChainCallback &&fccb)
{
  const auto session = req->session();

  const auto json_data = req->jsonObject();
  const Json::Value book = (*json_data)[VALUE::BOOK::BOOK];
  if (BookExist::checkExistBook(book))
  {
    fccb();
    return;
  }
  LOG_INFO << "tryed operate. but book is not exist";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k400BadRequest);
  res->setContentTypeCode(CT_TEXT_PLAIN);
  res->setBody("book is not exist");
  fcb(res);
}
