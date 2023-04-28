'use strict';
import { ShowBooks } from './bookUtil.js';

class BookShowState extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index: -1,
        };
    }
    ShowBookDetail(bookDetail) {
        let bookCollateralDetailHtml;
        if (bookDetail.onix) {
            bookCollateralDetailHtml = bookDetail.onix.CollateralDetail.TextContent.map((textContent, index) => (
                <p key={index}>{textContent.Text}</p>
            ));
        }
        return (<div>
            <h2>{bookDetail.summary.title}</h2>
            <img src={bookDetail.summary.cover} alt="book_image" width="300" height=" auto" />
            <p>{bookDetail.summary.author}</p>
            <div>{bookCollateralDetailHtml}</div>
            <hr></hr>
        </div>);
    }
    render() {
        let { books } = this.props;
        let bookDetailHtml;
        const bookButton = (index) => {
            return (<button onClick={() => this.setState({ index: index })} disabled={books[index].detail.onix === undefined} >詳細を見る</button>);
        }
        //詳細を見るボタンが押されたら、その本の詳細を表示　
        if (this.state.index !== -1) {
            bookDetailHtml = this.ShowBookDetail(books[this.state.index].detail);
        }
        return (
            <div>
                <hr></hr>
                {bookDetailHtml}
                <ShowBooks
                    books={books}
                    bookButton={bookButton}
                />
            </div>
        );

    }
};

export default BookShowState;
