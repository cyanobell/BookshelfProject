'use strict';

const e = React.createElement;
function getBookJson(isbn) {
  const url = "https://api.openbd.jp/v1/get?isbn=" + isbn;
  return fetch(url).then(response => response.json()).then(data => {
    if (data && data[0]) {
      console.log("call isbn api success");
      return data[0];
    } else {
      return {
        summary: {
          title: "本の情報を取得できませんでした。isbn:" + isbn
        }
      };
    }
  }).catch(error => {
    console.error("Error occurred while fetching book data:", error);
    return {
      summary: {
        title: "本の情報を取得できませんでした。isbn:" + isbn
      }
    };
  });
}
function BookButton(props) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => props.onClick(book)
  }, props.bookButtonText());
}
function ShowBooks({
  books,
  bookDetails,
  bookButton
}) {
  if (books.length === 0) {
    return /*#__PURE__*/React.createElement("div", null, "\u672C\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002");
  }
  if (bookDetails.length === 0) {
    return /*#__PURE__*/React.createElement("div", null, "\u60C5\u5831\u3092\u53D6\u5F97\u4E2D\u3067\u3059\u3002");
  }
  const readStateText = read_state => {
    switch (read_state) {
      case 0:
        return "未読";
      case 1:
        return "読み止し";
      case 2:
        return "読了";
    }
  };
  const listItems = books.map((book, index) => {
    if (bookDetails.length > index) {
      return /*#__PURE__*/React.createElement("tbody", {
        key: book.id
      }, /*#__PURE__*/React.createElement("tr", {
        className: "bookDetails"
      }, /*#__PURE__*/React.createElement("td", null, bookDetails[index].summary.title), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("img", {
        src: bookDetails[index].summary.cover,
        alt: "book_image",
        width: "100",
        height: " auto"
      })), /*#__PURE__*/React.createElement("td", null, ":"), /*#__PURE__*/React.createElement("td", null, readStateText(book.read_state)), /*#__PURE__*/React.createElement("td", null, bookButton(index))));
    } else {
      return /*#__PURE__*/React.createElement("tbody", {
        key: book.id
      }, /*#__PURE__*/React.createElement("tr", {
        className: "bookDetails"
      }, /*#__PURE__*/React.createElement("td", null)));
    }
  });
  return /*#__PURE__*/React.createElement("table", null, listItems);
}
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
    }), /*#__PURE__*/React.createElement("p", null, bookDetail.summary.author), /*#__PURE__*/React.createElement("div", null, bookCollateralDetailHtml));
  }
  render() {
    let {
      books,
      bookDetails
    } = this.props;
    let bookDetailHtml;
    const bookButton = index => {
      return /*#__PURE__*/React.createElement("button", {
        type: "submit",
        onClick: () => this.setState({
          index: index
        }),
        disabled: bookDetails[index].onix === undefined
      }, "\u8A73\u7D30\u3092\u898B\u308B");
    };
    //詳細を見るボタンが押されたら、その本の詳細を表示　
    if (this.state.index !== -1) {
      bookDetailHtml = this.ShowBookDetail(bookDetails[this.state.index]);
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), bookDetailHtml, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: bookButton,
      bookDetails: bookDetails
    }));
  }
}
;
class Bookshelf extends React.Component {
  ///this class Call API
  constructor(props) {
    super(props);
    this.state = {
      server_response: '',
      inputingIsbn: '',
      books: [],
      bookDetails: [],
      mode_state: 0
    };
    this.loadIsbn();
  }
  addBookDetails(book) {
    if (!book) {
      return;
    }
    getBookJson(book.isbn).then(newBookDetail => {
      this.setState({
        bookDetails: this.state.bookDetails.concat([newBookDetail])
      });
    });
  }
  loadIsbn() {
    const path = window.location.pathname;
    const shared_id = path.split('/')[2];
    fetch(`/api/get_shared_books/${shared_id}`, {
      method: 'GET'
    }).then(data => data.json()).then(books => {
      console.log(books);
      this.setState({
        books: this.state.books.concat(books)
      });
      books.forEach(book => {
        this.addBookDetails(book);
      });
    });
  }
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "Bookshelf"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ServerResponse"
    }, this.state.server_response), /*#__PURE__*/React.createElement(BookShowState, {
      books: this.state.books,
      bookDetails: this.state.bookDetails
    }));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));