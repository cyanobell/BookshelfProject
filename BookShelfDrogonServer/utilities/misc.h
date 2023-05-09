#include <string>
namespace utilities
{
  inline bool strIsNumber(const std::string &str){ return str.find_first_not_of("0123456789") == std::string::npos; }
  inline int charToInt(const char &c){ return c - '0'; }
}