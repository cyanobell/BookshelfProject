'use strict';

import { ShowBooks } from './bookUtil.js';
function BookDeleteState({
  books,
  deleteBook
}) {
  const bookButton = index => {
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => deleteBook(index)
    }, "\u672C\u3092\u524A\u9664");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ShowBooks, {
    books: books,
    bookButton: bookButton
  }));
}
export default BookDeleteState;