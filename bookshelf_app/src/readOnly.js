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
            return { summary: { title: "本の情報を取得できませんでした。isbn:" + isbn } };
        }
    } catch (error) {
        console.error("Error occurred while fetching book data:", error);
        return { summary: { title: "本のデータを取得中にエラーが発生しました isbn:" + isbn } };
    }
}

function BookButton(props) {
    return <button onClick={() => props.onClick(book)}>{props.bookButtonText()}</button>;
}

function ShowBooks({ books, bookButton }) {
    if (books.length === 0) {
        return <div>本が登録されていません。</div>;
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
        if (book.detail !== undefined) {
            return (
                <tbody key={book.id}>
                    <tr className="bookDetail">
                        <td>{book.detail.summary.title}</td>
                        <td><img src={book.detail.summary.cover}
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
        let { books } = this.props;
        let bookDetailHtml;
        const bookButton = (index) => {
            return (<button type="submit" onClick={() => this.setState({ index: index })} disabled={books[index].detail.onix === undefined} >詳細を見る</button>);
        }
        //詳細を見るボタンが押されたら、その本の詳細を表示　
        if (this.state.index !== -1) {
            bookDetailHtml = this.ShowBookDetail(books[this.state.index].detail);
        }
        return (
            <div>
                <hr></hr>
                {bookDetailHtml}
                <hr></hr>
                <ShowBooks
                    books={books}
                    bookButton={bookButton}
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

    async loadIsbn() {
        const path = window.location.pathname;
        const shared_id = path.split('/')[2];
        try {
            const response = await fetch(`/api/get_shared_books/${shared_id}`, {
                method: 'GET',
            });
            const books = await response.json();
            for(const book of books){
                book.detail = await getBookJson(book.isbn);
            }
            this.setState({ books: books });
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        return (
            <div className="Bookshelf">
                <div className="ServerResponse">{this.state.server_response}</div>
                {<BookShowState
                    books={this.state.books}
                />}
            </div>
        );
    }
}

const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render(<Bookshelf />);
