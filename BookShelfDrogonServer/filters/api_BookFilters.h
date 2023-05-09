/**
 *
 *  api_BookFilters.h
 *
 */

#pragma once

#include <drogon/HttpFilter.h>

namespace api
{
  using namespace drogon;
  class BookEditPermissionFilter : public HttpFilter<BookEditPermissionFilter>
  {
    bool checkEditPermission(const Json::Value &book, const SessionPtr &session);

  public:
    BookEditPermissionFilter() {}
    void doFilter(const HttpRequestPtr &req,
                  FilterCallback &&fcb,
                  FilterChainCallback &&fccb) override;
  };
  class IsbnCodeFilter : public HttpFilter<IsbnCodeFilter>
  {
    bool checkIsValidISBN(const std::string &isbn_str);

  public:
    IsbnCodeFilter() {}
    void doFilter(const HttpRequestPtr &req,
                  FilterCallback &&fcb,
                  FilterChainCallback &&fccb) override;
  };

  namespace BookExist
  {
    bool checkExistBook(const Json::Value &book);
    bool checkExistIsbn(int user_id, std::string isbn);
  }

  class IsbnAlreadyExistFilter : public HttpFilter<IsbnAlreadyExistFilter>
  {

  public:
    IsbnAlreadyExistFilter() {}
    void doFilter(const HttpRequestPtr &req,
                  FilterCallback &&fcb,
                  FilterChainCallback &&fccb) override;
  };

  class BookNotExistFilter : public HttpFilter<BookNotExistFilter>
  {

  public:
    BookNotExistFilter() {}
    void doFilter(const HttpRequestPtr &req,
                  FilterCallback &&fcb,
                  FilterChainCallback &&fccb) override;
  };

}
