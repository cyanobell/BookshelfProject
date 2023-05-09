/**
 *
 *  LoginFilter.h
 *
 */

#pragma once

#include <drogon/HttpFilter.h>

class LoginFilter : public drogon::HttpFilter<LoginFilter>
{
  bool checkExistUserid(int user_id);

public:
  LoginFilter() {}
  void doFilter(const drogon::HttpRequestPtr &req,
                drogon::FilterCallback &&fcb,
                drogon::FilterChainCallback &&fccb) override;
};
