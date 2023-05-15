'use strict';

import BookShowState from './BookShowState.js';
import CallAPIRapper from './CallAPIRapper.js';
class Bookshelf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      books: undefined,
      titleText: '',
      isBooksShow: false,
      selectedIndex: undefined
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
            books: book_json.books,
            titleText: `${user_name_json.user_name}の本棚`,
            isBooksShow: true
          });
          document.title = `技術書籍in本棚サイト-${user_name_json.user_name}の本棚`;
          return;
        case 'user id is not found':
          this.setState({
            titleText: 'ユーザーが見つかりませんでした。'
          });
          document.title = '技術書籍in本棚サイト-ユーザーが見つかりませんでした。';
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
  detailOnClick = async index => {
    const scrollToOptions = {
      top: 0,
      behavior: 'smooth'
    };
    window.scrollTo(scrollToOptions);
    this.setState({
      selectedIndex: index
    });
  };
  getBookSearchAmazonURL = () => {
    if (this.state.selectedIndex === undefined || this.state.books === undefined) {
      return '';
    }
    const book = this.state.books[this.state.selectedIndex];
    const isbn_str = book.isbn.toString();
    return `https://www.amazon.co.jp/s?k=${isbn_str.substring(0, 3)}-${isbn_str.substring(3)}`;
  };
  bookSearchAmazonButton = () => {
    const amazonUrl = this.getBookSearchAmazonURL();
    if (amazonUrl === '') {
      return /*#__PURE__*/React.createElement(React.Fragment, null);
    }
    return /*#__PURE__*/React.createElement("a", {
      className: "button",
      href: amazonUrl,
      target: "_blank",
      rel: "noopener noreferrer"
    }, "amazon\u3067\u691C\u7D22");
  };
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "Bookshelf"
    }, /*#__PURE__*/React.createElement("h1", null, this.state.titleText, " "), /*#__PURE__*/React.createElement("div", {
      className: "ServerResponse"
    }, this.state.server_response), /*#__PURE__*/React.createElement("hr", null), this.state.isBooksShow !== undefined && /*#__PURE__*/React.createElement(BookShowState, {
      books: this.state.books,
      detailOnClick: this.detailOnClick,
      addHtml: this.bookSearchAmazonButton()
    }));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));