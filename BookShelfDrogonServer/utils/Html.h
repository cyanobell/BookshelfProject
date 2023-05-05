#pragma once
#include <string>
namespace util{
  class Html{
    std::string html_str;
  public:
    Html(const char* filename);
    operator std::string() const{return this->html_str;};
  };
}