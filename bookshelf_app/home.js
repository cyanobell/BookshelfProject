'use strict';

import BookShowState from './BookShowState.js';
import BookAddState from './BookAddState.js';
import BookReadingChangeState from './BookReadingChangeState.js';
import BookDeleteState from './BookDeleteState.js';
import CallAPIRapper from './CallAPIRapper.js';
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
  constructor(props) {
    super(props);
    this.state = {
      server_response: ' ',
      inputingIsbn: '',
      books: undefined,
      mode_state: 0
    };
    this.loadBooks();
  }
  loadBooks = async () => {
    try {
      const json = await CallAPIRapper.loadBooks();
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          this.setState({
            books: json.books
          });
          return;
        case 'user is not logined':
          this.setState({
            server_response: 'セッション切れです。再ログインしてください。'
          });
          return;
        default:
          this.setState({
            server_response: 'サーバーエラーが発生しました。'
          });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  };
  registerNewBook = async inputingIsbn => {
    if (inputingIsbn.length === 0) {
      console.log('res: empty');
      this.setState({
        server_response: '入力欄が空です。'
      });
      return;
    }
    try {
      const json = await CallAPIRapper.registerNewIsbn(inputingIsbn);
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          this.setState({
            server_response: '登録できました！'
          });
          this.setState({
            inputingIsbn: ''
          });
          this.setState({
            books: this.state.books.concat([json.book])
          });
          return;
        case 'user is not logined':
          this.setState({
            server_response: 'セッション切れです。再ログインしてください。'
          });
          return;
        case 'input is empty':
          this.setState({
            server_response: '入力欄が空です。'
          });
          return;
        case 'isbn is too old or wrong':
          this.setState({
            server_response: 'ISBNコードが間違っているか、対応していない形式です。'
          });
          return;
        case 'book is already exist':
          this.setState({
            server_response: 'その本はすでに登録されています。'
          });
          return;
        default:
          this.setState({
            server_response: 'サーバーエラーが発生しました。'
          });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  };
  changeBookReadState = async (index, new_read_state) => {
    try {
      const json = await CallAPIRapper.changeBookReadState(this.state.books[index], new_read_state);
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
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
          return;
        case 'user is not logined':
          this.setState({
            server_response: 'セッション切れです。再ログインしてください。'
          });
          return;
        default:
          this.setState({
            server_response: 'サーバーエラーが発生しました。'
          });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  };
  deleteBook = async index => {
    try {
      const json = await CallAPIRapper.deleteBook(this.state.books[index]);
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          this.setState({
            server_response: this.state.books[index].detail.summary.title + ' を削除しました。'
          });
          this.setState({
            books: this.state.books.filter((book, findex) => findex !== index)
          });
          return;
        case 'user is not logined':
          this.setState({
            server_response: 'セッション切れです。再ログインしてください。'
          });
          return;
        default:
          this.setState({
            server_response: 'サーバーエラーが発生しました。'
          });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  };
  shareUrlCopyToCrip = async () => {
    try {
      const json = await CallAPIRapper.getLoginingUserShareingId();
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          const shareUrl = `${window.location.origin}/shared_books/${json.user_id}`;
          navigator.clipboard.writeText(shareUrl).then(() => {
            console.log(shareUrl + " was copyed");
            this.setState({
              server_response: 'クリップボードに共有用URLをコピーしました。'
            });
          }, () => {
            console.log(shareUrl + " :can not copy to clipboard");
            this.setState({
              server_response: 'クリップボードにアクセスできませんでした URL: ' + shareUrl
            });
          });
          return;
        case 'user is not logined':
          this.setState({
            server_response: 'セッション切れです。再ログインしてください。'
          });
          return;
        default:
          this.setState({
            server_response: 'サーバーエラーが発生しました。'
          });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  };
  render() {
    const modeStateHtml = mode_state => {
      switch (mode_state) {
        case 0:
          return /*#__PURE__*/React.createElement(BookShowState, {
            detailOnClick: index => {
              const scrollToOptions = {
                top: 0,
                behavior: 'smooth'
              };
              window.scrollTo(scrollToOptions);
            },
            books: this.state.books,
            addHtml: /*#__PURE__*/React.createElement(React.Fragment, null)
          });
        case 1:
          return /*#__PURE__*/React.createElement(BookAddState, {
            submitOnClick: this.registerNewBook,
            books: this.state.books
          });
        case 2:
          return /*#__PURE__*/React.createElement(BookReadingChangeState, {
            books: this.state.books,
            changeReadState: index => {
              let read_state = this.state.books[index].read_state;
              let new_read_state = read_state < 2 ? read_state + 1 : 0;
              this.changeBookReadState(index, new_read_state);
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
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        textAlign: 'right',
        padding: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => this.shareUrlCopyToCrip()
    }, "\u672C\u68DA\u3092\u5171\u6709"), /*#__PURE__*/React.createElement("button", {
      onClick: () => location.href = '/logout'
    }, "\u30ED\u30B0\u30A2\u30A6\u30C8")), /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '35px'
      },
      className: "ServerResponse"
    }, this.state.server_response), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ModeSelecter, {
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
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", null, modeStateHtml(this.state.mode_state)));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));