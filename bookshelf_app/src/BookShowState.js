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
      bookCollateralDetailHtml = bookDetail.onix.CollateralDetail.TextContent.map((textContent, index) => (
        <p key={index}>{textContent.Text}</p>
      ));
    }
    return (<div>
      <hr></hr>
      <h2>{bookDetail.summary.title}</h2>
      <img src={bookDetail.summary.cover} alt="book_image" width="300" height=" auto" />
      <p>{bookDetail.summary.author}</p>
      <div>{bookCollateralDetailHtml}</div>
    </div>);
  }

  render() {
    const { books, detailOnClick, addHtml } = this.props;
    const bookButton = (index) => {
      return (<button onClick={() => { this.setState({ index: index }); detailOnClick(index); }} disabled={books[index].detail.onix === undefined} >詳細を見る</button>);
    }
    return (
      <div>
        <div>{this.state.index !== undefined && this.showBookDetail(books[this.state.index].detail)}</div>
        <div>{addHtml}</div>
        {this.state.index !== undefined && <hr></hr>}
        <ShowBooks
          books={books}
          bookButton={bookButton}
        />
      </div>
    );
  }
};

export default BookShowState;
