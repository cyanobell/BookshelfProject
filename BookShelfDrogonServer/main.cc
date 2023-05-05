#include <drogon/drogon.h>
int main() {
    //Set HTTP listener address and port
    drogon::app().loadConfigFile("../config.json");
    drogon::app().run();
    return 0;
}
