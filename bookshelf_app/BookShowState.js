'use strict';

import { ShowBooks } from './bookUtil.js';
class BookShowState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: -1
    };
  }
  ShowBookDetail(bookDetail) {
    let bookCollateralDetailHtml;
    if (bookDetail.onix) {
      bookCollateralDetailHtml = bookDetail.onix.CollateralDetail.TextContent.map((textContent, index) => /*#__PURE__*/React.createElement("p", {
        key: index
      }, textContent.Text));
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, bookDetail.summary.title), /*#__PURE__*/React.createElement("img", {
      src: bookDetail.summary.cover,
      alt: "book_image",
      width: "300",
      height: " auto"
    }), /*#__PURE__*/React.createElement("p", null, bookDetail.summary.author), /*#__PURE__*/React.createElement("div", null, bookCollateralDetailHtml), /*#__PURE__*/React.createElement("hr", null));
  }
  render() {
    let {
      books
    } = this.props;
    let bookDetailHtml;
    const bookButton = index => {
      return /*#__PURE__*/React.createElement("button", {
        onClick: () => this.setState({
          index: index
        }),
        disabled: books[index].detail.onix === undefined
      }, "\u8A73\u7D30\u3092\u898B\u308B");
    };
    //詳細を見るボタンが押されたら、その本の詳細を表示　
    if (this.state.index !== -1) {
      bookDetailHtml = this.ShowBookDetail(books[this.state.index].detail);
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), bookDetailHtml, /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: bookButton
    }));
  }
}
;
export default BookShowState;