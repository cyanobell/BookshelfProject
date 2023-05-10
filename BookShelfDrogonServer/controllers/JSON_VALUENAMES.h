#pragma once
namespace VALUE
{
  namespace SESSION
  {
    constexpr static const char *USER_NAME = "user_name";
    constexpr static const char *USER_ID = "user_id";
  }
  namespace USER
  {
    constexpr static const char *ID = "id";
    constexpr static const char *USER_NAME = "name";
    constexpr static const char *PASS_WORD = "pass";
    constexpr static const char *SHAREING_SEED = "shareing_seed";
    constexpr static const char *SHAREING_STATE = "shareing_state";
  }
  namespace BOOK
  {
    constexpr static const char *ID = "id";
    constexpr static const char *USER_ID = "user_id";
    constexpr static const char *ISBN = "isbn";
    constexpr static const char *READ_STATE = "read_state";

    constexpr static const char *BOOK = "book";
    constexpr static const char *NEW_READ_STATE = "new_read_state";
  }
}