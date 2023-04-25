'use strict';

const e = React.createElement;
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
function IsbnInputArea({
  inputingIsbn,
  inputOnChange,
  submitOnClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("div", null, "ISBN\u30B3\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "isbn",
    value: inputingIsbn,
    inputMode: "numeric",
    onChange: inputOnChange
  }), " "), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    onClick: submitOnClick
  }, "Add"));
}
class BookAddState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputingIsbn: ""
    };
  }
  render() {
    const {
      submitOnClick,
      books
    } = this.props;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(IsbnInputArea, {
      inputingIsbn: this.state.inputingIsbn,
      submitOnClick: () => {
        submitOnClick(this.state.inputingIsbn);
        this.setState({
          inputingIsbn: ""
        });
      },
      inputOnChange: e => {
        this.setState({
          inputingIsbn: e.target.value.replace(/[^0-9]/g, "")
        });
      }
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: id => ""
    }));
  }
}
function BookReadingChangeState({
  books,
  changeReadState
}) {
  const bookButton = index => {
    return /*#__PURE__*/React.createElement("button", {
      type: "submit",
      onClick: () => changeReadState(index)
    }, "\u8AAD\u66F8\u72B6\u614B\u5909\u66F4");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ShowBooks, {
    books: books,
    bookButton: bookButton
  }));
}
function BookDeleteState({
  books,
  deleteBook
}) {
  const bookButton = index => {
    return /*#__PURE__*/React.createElement("button", {
      type: "submit",
      onClick: () => deleteBook(index)
    }, "\u672C\u3092\u524A\u9664");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ShowBooks, {
    books: books,
    bookButton: bookButton
  }));
}
function ModeSelecter(props) {
  return /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ModeSelecter",
    onClick: props.onClickShow,
    defaultChecked: true
  }), "\u95B2\u89A7\u30E2\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ModeSelecter",
    onClick: props.onClickAdd
  }), "\u66F8\u7C4D\u8FFD\u52A0\u30E2\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ModeSelecter",
    onClick: props.onClickChange
  }), "\u8AAD\u66F8\u30B9\u30C6\u30FC\u30C8\u5909\u66F4\u30E2\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ModeSelecter",
    onClick: props.onClickDelete
  }), "\u66F8\u7C4D\u524A\u9664\u30E2\u30FC\u30C9");
}
class Bookshelf extends React.Component {
  ///this class Call API
  constructor(props) {
    super(props);
    this.state = {
      server_response: '',
      inputingIsbn: '',
      books: [],
      mode_state: 0
    };
    this.loadIsbn();
  }
  async loadIsbn() {
    const path = window.location.pathname;
    const shared_id = path.split('/')[2];
    try {
      const response = await fetch(`/api/get_have_books`, {
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
  async registerIsbn(inputingIsbn) {
    try {
      if (inputingIsbn.length === 0) {
        this.setState({
          server_response: '入力欄が空です。'
        });
        return;
      }
      let send_data = {
        isbn: inputingIsbn
      };
      const response = await fetch('/api/register_book', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      const json = await response.json();
      if (json.text === 'success') {
        this.setState({
          server_response: '登録できました！'
        });
        this.setState({
          inputingIsbn: ''
        });
        json.book.detail = await getBookJson(json.book.isbn);
        this.setState({
          books: this.state.books.concat([json.book])
        });
      } else if (json.text === 'already registered') {
        this.setState({
          server_response: 'その本はすでに登録されています。'
        });
      } else if (json.text === 'isbn is too old or wrong.') {
        this.setState({
          server_response: 'ISBNコードが間違っているか、対応していない形式です。'
        });
      } else {
        this.setState({
          server_response: 'サーバーエラーです。登録できませんでした。'
        });
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'エラーが発生しました。'
      });
    }
  }
  async changeReadState(index, new_read_state) {
    try {
      let send_data = {
        book: this.state.books[index],
        new_read_state: new_read_state
      };
      const response = await fetch('/api/change_read_state', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      const json = await response.json();
      console.log(json.text);
      if (json.text === 'success') {
        this.setState({
          server_response: '変更できました！'
        });
        this.setState({
          inputingIsbn: ''
        });
        const {
          books
        } = this.state;
        const newBooks = [...books];
        newBooks[index] = {
          ...books[index],
          read_state: new_read_state
        };
        this.setState({
          books: newBooks
        });
      } else {
        this.setState({
          server_response: 'サーバーエラーです。登録できませんでした。'
        });
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'エラーが発生しました。'
      });
    }
  }
  async deleteBook(index) {
    try {
      let send_data = {
        book: this.state.books[index]
      };
      const response = await fetch('/api/delete_book', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      const json = await response.json();
      console.log(json.text);
      if (json.text === 'success') {
        this.setState({
          server_response: this.state.books[index].detail.summary.title + ' を削除しました。'
        });
        this.setState({
          books: this.state.books.filter((book, findex) => findex !== index)
        });
      } else {
        this.setState({
          server_response: 'サーバーエラーです。登録できませんでした。'
        });
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'エラーが発生しました。'
      });
    }
  }
  render() {
    const modeStateHtml = mode_state => {
      switch (mode_state) {
        case 0:
          return /*#__PURE__*/React.createElement(BookShowState, {
            books: this.state.books
          });
        case 1:
          return /*#__PURE__*/React.createElement(BookAddState, {
            submitOnClick: inputedIsbn => this.registerIsbn(inputedIsbn),
            books: this.state.books
          });
        case 2:
          return /*#__PURE__*/React.createElement(BookReadingChangeState, {
            books: this.state.books,
            changeReadState: index => {
              let read_state = this.state.books[index].read_state;
              let new_read_state = read_state < 2 ? read_state + 1 : 0;
              this.changeReadState(index, new_read_state);
            }
          });
        case 3:
          return /*#__PURE__*/React.createElement(BookDeleteState, {
            books: this.state.books,
            deleteBook: index => {
              this.deleteBook(index);
            }
          });
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "Bookshelf"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ServerResponse"
    }, this.state.server_response), /*#__PURE__*/React.createElement(ModeSelecter, {
      mode_state: this.state.mode_state,
      onClickShow: () => this.setState({
        mode_state: 0,
        server_response: ''
      }),
      onClickAdd: () => this.setState({
        mode_state: 1,
        server_response: ''
      }),
      onClickChange: () => this.setState({
        mode_state: 2,
        server_response: ''
      }),
      onClickDelete: () => this.setState({
        mode_state: 3,
        server_response: ''
      })
    }), modeStateHtml(this.state.mode_state));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));