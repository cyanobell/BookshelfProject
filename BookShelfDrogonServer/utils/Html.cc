#include <fstream>
#include <iostream>
#include <json/json.h>
#include "Html.h"

using namespace util;
Html::Html(const char *filename)
{
  Json::Value config;
  Json::Reader reader;
  std::ifstream config_file("../config.json");

  if (!reader.parse(config_file, config))
  {
    std::cerr << "Failed to parse config file" << std::endl;
    return;
  }
  std::string upload_path = config["upload_path"].asString();
  std::ifstream infile(upload_path + "/" + filename);
  std::string str((std::istreambuf_iterator<char>(infile)), std::istreambuf_iterator<char>());
  html_str = str;
}