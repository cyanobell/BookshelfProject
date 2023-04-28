'use strict';

import { ShowBooks } from './bookUtil.js';
function BookReadingChangeState({
  books,
  changeReadState
}) {
  const bookButton = index => {
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => changeReadState(index)
    }, "\u8AAD\u66F8\u72B6\u614B\u5909\u66F4");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ShowBooks, {
    books: books,
    bookButton: bookButton
  }));
}
export default BookReadingChangeState;