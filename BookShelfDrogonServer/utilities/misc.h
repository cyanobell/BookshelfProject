#include <string>
#include <fstream>
#include <json/json.h>
#include <sstream>

namespace utilities
{
  inline bool strIsNumber(const std::string &str) { return str.find_first_not_of("0123456789") == std::string::npos; }
  inline int charToInt(const char &c) { return c - '0'; }
  inline Json::Value loadJsonFile(const char *json_filename)
  {
    std::ifstream json_file;
    json_file.open(json_filename);
    if (!json_file)
    {
      LOG_ERROR << "設定ファイルの読み込みに失敗しました。";
      throw;
    }
    std::stringstream json_file_ss;
    json_file_ss << json_file.rdbuf();
    std::string json_str = json_file_ss.str();
    json_file.close();

    Json::Reader reader;
    Json::Value value;
    reader.parse(json_str, value);
    return value;
  }
}