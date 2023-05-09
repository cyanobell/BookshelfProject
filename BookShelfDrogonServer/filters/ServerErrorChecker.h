/**
 *
 *  ServerErrorChecker.h
 *
 */

#pragma once

#include <drogon/HttpFilter.h>
#include <drogon/HttpController.h>


class ServerErrorChecker : public drogon::HttpFilter<ServerErrorChecker>
{
  constexpr static const char* e500_filename = "../../bookshelf_app/500.html";
  bool start_succeeded;
  bool onStart();
  bool onAccess() { return true; }

public:
  ServerErrorChecker() : start_succeeded(false) {}
  void doFilter(const drogon::HttpRequestPtr &req,
                drogon::FilterCallback &&fcb,
                drogon::FilterChainCallback &&fccb) override;
};
