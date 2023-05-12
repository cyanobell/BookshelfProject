#include <drogon/drogon.h>


int main()
{
    // Set HTTP listener address and port
    LOG_INFO << "server awaken";
    drogon::app().loadConfigFile("../config.json");
    constexpr static const char *e404_filename = "../../bookshelf_app/404.html";
    auto res = drogon::HttpResponse::newFileResponse(e404_filename);
    drogon::app().setCustom404Page(res);
    drogon::app().run();
    LOG_INFO << "server closed";
    return 0;
}
