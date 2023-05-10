'use strict';

import BookShowState from './BookShowState.js';
import CallAPIRapper from './CallAPIRapper.js';
class Bookshelf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      books: undefined,
      titleText: '',
      isBooksShow: false
    };
  }
  async componentDidMount() {
    const path = window.location.pathname;
    const shared_id = path.split('/')[2];
    try {
      const user_name_json = await CallAPIRapper.loadUsernameWithShareingId(shared_id);
      console.log('res: ' + user_name_json.text);
      switch (user_name_json.text) {
        case 'success':
          const book_json = await CallAPIRapper.loadBooksWithSharingId(shared_id);
          this.setState({
            books: book_json.books
          });
          this.setState({
            titleText: user_name_json.user_name + 'の本棚'
          });
          this.setState({
            isBooksShow: user_name_json.user_name + 'の本棚'
          });
          document.title = '技術書籍in本棚サイト-' + user_name_json.user_name + 'の本棚';
          return;
        case 'user id is not found':
          this.setState({
            titleText: 'ユーザーが見つかりませんでした。'
          });
          document.title = '技術書籍in本棚サイト-' + 'ユーザーが見つかりませんでした。';
          return;
        default:
          this.setState({
            titleText: 'サーバーエラーが発生しました。'
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
    }, /*#__PURE__*/React.createElement("h1", null, this.state.titleText, " "), /*#__PURE__*/React.createElement("div", {
      className: "ServerResponse"
    }, this.state.server_response), this.state.isBooksShow && /*#__PURE__*/React.createElement(BookShowState, {
      books: this.state.books
    }));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));