'use strict';

import { ShowBooks } from './bookUtil.js';
class BookShowState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: undefined
    };
  }
  showBookDetail(bookDetail) {
    let bookCollateralDetailHtml;
    if (bookDetail.onix) {
      bookCollateralDetailHtml = bookDetail.onix.CollateralDetail.TextContent.map((textContent, index) => /*#__PURE__*/React.createElement("p", {
        key: index
      }, textContent.Text));
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("h2", null, bookDetail.summary.title), /*#__PURE__*/React.createElement("img", {
      src: bookDetail.summary.cover,
      alt: "book_image",
      width: "300",
      height: " auto"
    }), /*#__PURE__*/React.createElement("p", null, bookDetail.summary.author), /*#__PURE__*/React.createElement("div", null, bookCollateralDetailHtml));
  }
  render() {
    const {
      books,
      detailOnClick,
      addHtml
    } = this.props;
    const bookButton = index => {
      return /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          this.setState({
            index: index
          });
          detailOnClick(index);
        },
        disabled: books[index].detail.onix === undefined
      }, "\u8A73\u7D30\u3092\u898B\u308B");
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, this.state.index !== undefined && this.showBookDetail(books[this.state.index].detail)), /*#__PURE__*/React.createElement("div", null, addHtml), this.state.index !== undefined && /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: bookButton
    }));
  }
}
;
export default BookShowState;