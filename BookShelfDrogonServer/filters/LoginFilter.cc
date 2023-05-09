/**
 *
 *  LoginFilter.cc
 *
 */

#include "LoginFilter.h"
#include <drogon/drogon.h>
#include "../controllers/JSON_VALUENAMES.h"

using namespace drogon;

bool LoginFilter::checkExistUserid(int user_id)
{
  const auto client_ptr = app().getDbClient();
  const auto result = client_ptr->execSqlSync("SELECT * FROM users WHERE id = $1 LIMIT 1",
                                              user_id);
  return result.size() > 0;
}

void LoginFilter::doFilter(const HttpRequestPtr &req,
                           FilterCallback &&fcb,
                           FilterChainCallback &&fccb)
{
  const auto session = req->session();
  if (session->find(VALUE::SESSION::USER_ID) && checkExistUserid(session->get<int>(VALUE::SESSION::USER_ID)))
  {
    fccb();
    return;
  }
  LOG_INFO << "not login user trying operate";
  auto res = HttpResponse::newHttpResponse();
  res->setStatusCode(k401Unauthorized);
  res->setBody("user is not logined");
  fcb(res);
}
