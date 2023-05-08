'use strict';

import { getBookJson } from './bookUtil.js';
import BookShowState from './BookShowState.js';
import CallAPIRapper from './CallAPIRapper.js';
class Bookshelf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      title_text: ''
    };
    this.loadBooks();
  }
  async loadBooks() {
    const path = window.location.pathname;
    const shared_id = path.split('/')[2];
    try {
      const user_name_json = await CallAPIRapper.loadUsernameWithSharedId(shared_id);
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          const book_json = await CallAPIRapper.loadBooksWithSharedId(shared_id);
          this.setState({
            books: book_json.books
          });
          this.setState({
            title_text: user_name_json.user_name + 'の本棚'
          });
          document.title = '技術書籍in本棚サイト-' + user_name_json.user_name + 'の本棚';
          return;
        case 'user is not logined':
          this.setState({
            title_text: 'ユーザーが見つかりませんでした。'
          });
          document.title = '技術書籍in本棚サイト-' + 'ユーザーが見つかりませんでした。';
          return;
        default:
          this.setState({
            title_text: 'サーバーエラーが発生しました。'
          });
          return;
      }
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "Bookshelf"
    }, /*#__PURE__*/React.createElement("h1", null, this.state.title_text, " "), /*#__PURE__*/React.createElement("div", {
      className: "ServerResponse"
    }, this.state.server_response), /*#__PURE__*/React.createElement(BookShowState, {
      books: this.state.books
    }));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));