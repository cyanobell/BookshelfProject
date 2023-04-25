'use strict';
const e = React.createElement;
function getBookJson(isbn) {
    const url = "https://api.openbd.jp/v1/get?isbn=" + isbn;
    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data && data[0]) {
                console.log("call isbn api success");
                return data[0];
            } else {
                return { summary: { title: "本の情報を取得できませんでした。isbn:" + isbn } };
            }
        })
        .catch((error) => {
            console.error("Error occurred while fetching book data:", error);
            return { summary: { title: "本の情報を取得できませんでした。isbn:" + isbn } };
        });
}

function BookButton(props) {
    return <button onClick={() => props.onClick(book)}>{props.bookButtonText()}</button>;
}

function ShowBooks({ books, bookDetails, bookButton }) {
    if (books.length === 0) {
        return <div>本が登録されていません。</div>;
    }

    if (bookDetails.length === 0) {
        return <div>情報を取得中です。</div>;
    }
    const readStateText = (read_state) => {
        switch (read_state) {
            case 0:
                return "未読";
            case 1:
                return "読み止し";
            case 2:
                return "読了";
        }
    }
    const listItems = books.map((book, index) => {
        if (bookDetails.length > index) {
            return (
                <tbody key={book.id}>
                    <tr className="bookDetails">
                        <td>{bookDetails[index].summary.title}</td>
                        <td><img src={bookDetails[index].summary.cover}
                            alt="book_image" width="100" height=" auto" /></td>
                        <td>:</td>
                        <td>{readStateText(book.read_state)}</td>
                        <td>{bookButton(index)}</td>
                    </tr>
                </tbody>
            );
        } else {
            return (
                <tbody key={book.id}>
                    <tr className="bookDetails"><td></td></tr>
                </tbody>
            );
        }
    });
    return (
        <table>
            {listItems}
        </table>
    );
}

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

        </div>);
    }
    render() {
        let { books, bookDetails } = this.props;
        let bookDetailHtml;
        const bookButton = (index) => {
            return (<button type="submit" onClick={() => this.setState({ index: index })} disabled={bookDetails[index].onix === undefined} >詳細を見る</button>);
        }
        //詳細を見るボタンが押されたら、その本の詳細を表示　
        if (this.state.index !== -1) {
            bookDetailHtml = this.ShowBookDetail(bookDetails[this.state.index]);
        }
        return (
            <div>
                <hr></hr>
                {bookDetailHtml}
                <hr></hr>
                <ShowBooks
                    books={books}
                    bookButton={bookButton}
                    bookDetails={bookDetails}
                />
            </div>
        );

    }
};

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

    addBookDetails(book) {
        if (!book) {
            return;
        }
        getBookJson(book.isbn).then((newBookDetail) => {
            this.setState({ bookDetails: this.state.bookDetails.concat([newBookDetail]) });
        });
    }

    loadIsbn() {
        const path = window.location.pathname;
        const shared_id = path.split('/')[2]; 
        fetch(`/api/get_shared_books/${shared_id}`, {
            method: 'GET',
        })
            .then((data) => data.json())
            .then((books) => {
                console.log(books);
                this.setState({ books: this.state.books.concat(books) });
                books.forEach((book) => {
                    this.addBookDetails(book);
                });
            });
    };

    render() {
        return (
            <div className="Bookshelf">
                <div className="ServerResponse">{this.state.server_response}</div>
                {<BookShowState
                    books={this.state.books}
                    bookDetails={this.state.bookDetails}
                />}
            </div>
        );
    }
}

const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render(<Bookshelf />);
