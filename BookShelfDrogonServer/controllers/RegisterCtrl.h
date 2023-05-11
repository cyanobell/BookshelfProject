#pragma once
#include <drogon/HttpController.h>

class RegisterCtrl : public drogon::HttpController<RegisterCtrl>
{
  constexpr static const char *html_filename = "../../bookshelf_app/register.html";

  constexpr static const int NAME_MIN_LENGTH = 4;
  constexpr static const int NAME_MAX_LENGTH = 50;
  constexpr static const int PASS_MIN_LENGTH = 4;
  constexpr static const int PASS_MAX_LENGTH = 50;
  bool checkExistUserShareingSeed(const std::string &shareing_seed) const;

public:
  METHOD_LIST_BEGIN
  ADD_METHOD_TO(RegisterCtrl::get, "/register", drogon::Get, "ServerErrorChecker");
  ADD_METHOD_TO(RegisterCtrl::registerUser, "/register", drogon::Post, "ServerErrorChecker");
  METHOD_LIST_END

  void get(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
  void registerUser(const drogon::HttpRequestPtr &req, std::function<void(const drogon::HttpResponsePtr &)> &&callback) const;
};
