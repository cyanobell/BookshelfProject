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
      server_response: '',
      inputingIsbn: '',
      books: [],
      mode_state: 0
    };
    this.loadIsbn();
  }
  loadIsbn = async () => {
    try {
      const books = await CallAPIRapper.loadIsbn();
      this.setState({
        books: books
      });
    } catch (error) {
      console.error(error);
    }
  };
  registerIsbn = async inputingIsbn => {
    try {
      if (inputingIsbn.length === 0) {
        this.setState({
          server_response: '入力欄が空です。'
        });
        return;
      }
      const json = await CallAPIRapper.registerIsbn(inputingIsbn);
      if (json.text === 'success') {
        this.setState({
          server_response: '登録できました！'
        });
        this.setState({
          inputingIsbn: ''
        });
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
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  };
  changeReadState = async (index, new_read_state) => {
    try {
      const json = await CallAPIRapper.changeReadState(this.state.books[index], new_read_state);
      console.log(json);
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
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  };
  deleteBook = async index => {
    try {
      const json = await CallAPIRapper.deleteBook(this.state.books[index]);
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
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  };
  shareUrlCopyToCrip = async () => {
    try {
      const response = await fetch(`/api/get_user_id`, {
        method: 'GET'
      });
      const json = await response.json();
      console.log(json.user_id);
      const shareUrl = `${window.location.origin}/shared_books/${json.user_id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.setState({
          server_response: 'クリップボードに共有用URLをコピーしました。'
        });
      }, () => {
        this.setState({
          server_response: 'URL: ' + shareUrl
        });
      });
    } catch (error) {
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
            books: this.state.books
          });
        case 1:
          return /*#__PURE__*/React.createElement(BookAddState, {
            submitOnClick: this.registerIsbn,
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
    }), modeStateHtml(this.state.mode_state));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));