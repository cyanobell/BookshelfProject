'use strict';

async function getBookJson(isbn) {
  const url = "https://api.openbd.jp/v1/get?isbn=" + isbn;
  try {
    const response = await fetch(url);
    const data = await response.json();
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
  } catch (error) {
    console.error("Error occurred while fetching book data:", error);
    return {
      summary: {
        title: "本のデータを取得中にエラーが発生しました isbn:" + isbn
      }
    };
  }
}
function BookButton(props) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => props.onClick(book)
  }, props.bookButtonText());
}
function ShowBooks({
  books,
  bookButton
}) {
  if (books.length === 0) {
    return /*#__PURE__*/React.createElement("div", null, "\u672C\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002");
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
    if (book.detail !== undefined) {
      return /*#__PURE__*/React.createElement("tbody", {
        key: book.id
      }, /*#__PURE__*/React.createElement("tr", {
        className: "bookDetail"
      }, /*#__PURE__*/React.createElement("td", null, book.detail.summary.title), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("img", {
        src: book.detail.summary.cover,
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
      books
    } = this.props;
    let bookDetailHtml;
    const bookButton = index => {
      return /*#__PURE__*/React.createElement("button", {
        type: "submit",
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
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), bookDetailHtml, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: bookButton
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
  async loadIsbn() {
    const path = window.location.pathname;
    const shared_id = path.split('/')[2];
    try {
      const response = await fetch(`/api/get_shared_books/${shared_id}`, {
        method: 'GET'
      });
      const books = await response.json();
      for (const book of books) {
        book.detail = await getBookJson(book.isbn);
      }
      this.setState({
        books: books
      });
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "Bookshelf"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ServerResponse"
    }, this.state.server_response), /*#__PURE__*/React.createElement(BookShowState, {
      books: this.state.books
    }));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));