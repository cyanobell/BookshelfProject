'use strict';

import { getBookJson } from './bookUtil.js';
import BookShowState from './BookShowState.js';
import CallAPIRapper from './CallAPIRapper.js';
class Bookshelf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      server_response: '',
      inputingIsbn: '',
      books: [],
      bookDetails: [],
      mode_state: 0,
      user_name: ''
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
      const user_name = await CallAPIRapper.loadUsernameWithSharedId(shared_id);
      this.setState({
        books: books
      });
      this.setState({
        user_name: user_name
      });
      document.title = '技術書籍in本棚サイト-' + user_name + 'の本棚';
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "Bookshelf"
    }, /*#__PURE__*/React.createElement("h1", null, this.state.user_name, " \u306E\u672C\u68DA"), /*#__PURE__*/React.createElement("div", {
      className: "ServerResponse"
    }, this.state.server_response), /*#__PURE__*/React.createElement(BookShowState, {
      books: this.state.books
    }));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));