/**
 *
 *  ServerErrorChecker.cc
 *
 */

#include "ServerErrorChecker.h"
#include <drogon/drogon.h>

using namespace drogon;

bool ServerErrorChecker::onStart()
{
  //Database Connect Check
  const auto client_ptr = app().getDbClient();
  if (!client_ptr || !client_ptr->hasAvailableConnections())
  {
    LOG_ERROR << "Database connection failed!";
    start_succeeded = false;
    return false;
  }
  LOG_INFO << "server start success";
  start_succeeded = true;
  return true;
}

void ServerErrorChecker::doFilter(const HttpRequestPtr &req,
                                  FilterCallback &&fcb,
                                  FilterChainCallback &&fccb)
{
  // Edit your logic here
  if (onAccess() && (start_succeeded || onStart()))
  {
    // Passed
    fccb();
    return;
  }

  // Check failed
  const auto res = HttpResponse::newFileResponse(e500_filename);
  res->setStatusCode(k500InternalServerError);
  fcb(res);
}
