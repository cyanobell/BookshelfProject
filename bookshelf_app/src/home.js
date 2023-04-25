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

function IsbnInputArea({ inputingIsbn, inputOnChange, submitOnClick }) {
    return (
        <div className="form-group">
            <div>ISBNコード<input type="text" name="isbn" value={inputingIsbn}
                inputMode="numeric"
                onChange={inputOnChange} /> </div>
            <button type="submit" onClick={submitOnClick}>Add</button>
        </div>
    );
}

class BookAddState extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputingIsbn: "",
        };
    }
    render() {
      const { submitOnClick, books } = this.props;
  
      return (
        <div>
          <hr></hr>
          <IsbnInputArea
            inputingIsbn={this.state.inputingIsbn}
            submitOnClick={() => {submitOnClick(this.state.inputingIsbn); this.setState({ inputingIsbn:""});}}
            inputOnChange={(e) => { this.setState({ inputingIsbn: e.target.value.replace(/[^0-9]/g, "") }) }}
          />
          <hr></hr>
          <ShowBooks books={books} bookButton={(id) => ""} />
        </div>
      );
    }
  }

function BookReadingChangeState({ books, changeReadState }) {
    const bookButton = (index) => {
        return (<button type="submit" onClick={() => changeReadState(index)}>読書状態変更</button>);
    }
    return (
        <div>
            <ShowBooks
                books={books}
                bookButton={bookButton}
            />
        </div>
    );
}

function BookDeleteState({ books, deleteBook }) {
    const bookButton = (index) => {
        return (<button type="submit" onClick={() => deleteBook(index)}>本を削除</button>);
    }
    return (
        <div>
            <ShowBooks
                books={books}
                bookButton={bookButton}
            />
        </div>
    );
}

function ModeSelecter(props) {
    return (
        <div className="form-group">
            <input type="radio" name="ModeSelecter" onClick={props.onClickShow} defaultChecked />閲覧モード
            <input type="radio" name="ModeSelecter" onClick={props.onClickAdd} />書籍追加モード
            <input type="radio" name="ModeSelecter" onClick={props.onClickChange} />読書ステート変更モード
            <input type="radio" name="ModeSelecter" onClick={props.onClickDelete} />書籍削除モード
        </div>
    );
}

class Bookshelf extends React.Component {
    ///this class Call API
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

    async loadIsbn() {
        const path = window.location.pathname;
        const shared_id = path.split('/')[2];
        try {
            const response = await fetch(`/api/get_have_books`, {
                method: 'GET',
            });
            const books = await response.json();
            for (const book of books) {
                book.detail = await getBookJson(book.isbn);
            }
            this.setState({ books: books });
        } catch (error) {
            console.error(error);
        }
    }

    async registerIsbn(inputingIsbn) {
        try {
            if (inputingIsbn.length === 0) {
                this.setState({ server_response: '入力欄が空です。' });
                return;
            }

            let send_data = { isbn: inputingIsbn };
            const response = await fetch('/api/register_book', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(send_data),
            });

            const json = await response.json();
            if (json.text === 'success') {
                this.setState({ server_response: '登録できました！' });
                this.setState({ inputingIsbn: '' });
                json.book.detail = await getBookJson(json.book.isbn);
                this.setState({ books: this.state.books.concat([json.book]) });
            } else if (json.text === 'already registered') {
                this.setState({ server_response: 'その本はすでに登録されています。' });
            } else if (json.text === 'isbn is too old or wrong.') {
                this.setState({ server_response: 'ISBNコードが間違っているか、対応していない形式です。' });
            } else {
                this.setState({ server_response: 'サーバーエラーです。登録できませんでした。' });
            }
        } catch (error) {
            console.error(error);
            this.setState({ server_response: 'エラーが発生しました。' });
        }
    }

    async changeReadState(index, new_read_state) {
        try {
            let send_data = { book: this.state.books[index], new_read_state: new_read_state };
            const response = await fetch('/api/change_read_state', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(send_data),
            });

            const json = await response.json();
            console.log(json.text);
            if (json.text === 'success') {
                this.setState({ server_response: '変更できました！' });
                this.setState({ inputingIsbn: '' });
                const { books } = this.state;
                const newBooks = [...books];
                newBooks[index] = { ...books[index], read_state: new_read_state };
                this.setState({ books: newBooks });
            } else {
                this.setState({ server_response: 'サーバーエラーです。登録できませんでした。' });
            }
        } catch (error) {
            console.error(error);
            this.setState({ server_response: 'エラーが発生しました。' });
        }
    }

    async deleteBook(index) {
        try {
            let send_data = { book: this.state.books[index] };
            const response = await fetch('/api/delete_book', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(send_data),
            });

            const json = await response.json();
            console.log(json.text);
            if (json.text === 'success') {
                this.setState({ server_response: this.state.books[index].detail.summary.title + ' を削除しました。' });
                this.setState({
                    books: this.state.books.filter((book, findex) => findex !== index),
                });
            } else {
                this.setState({ server_response: 'サーバーエラーです。登録できませんでした。' });
            }
        } catch (error) {
            console.error(error);
            this.setState({ server_response: 'エラーが発生しました。' });
        }
    }

    render() {
        const modeStateHtml = (mode_state) => {
            switch (mode_state) {
                case 0:
                    return (
                        <BookShowState
                            books={this.state.books}
                        />);
                case 1:
                    return (
                        <BookAddState
                            submitOnClick={(inputedIsbn) => this.registerIsbn(inputedIsbn)}
                            books={this.state.books}
                        />
                    );
                case 2:
                    return (<BookReadingChangeState
                        books={this.state.books}
                        changeReadState={(index) => {
                            let read_state = this.state.books[index].read_state;
                            let new_read_state = read_state < 2 ? read_state + 1 : 0;
                            this.changeReadState(index, new_read_state);
                        }}
                    />);
                case 3:
                    return (<BookDeleteState
                        books={this.state.books}
                        deleteBook={(index) => { this.deleteBook(index) }}
                    />);
            }
        }

        return (
            <div className="Bookshelf">
                <div className="ServerResponse">{this.state.server_response}</div>
                <ModeSelecter
                    mode_state={this.state.mode_state}
                    onClickShow={() => this.setState({ mode_state: 0 ,server_response:'' })}
                    onClickAdd={() => this.setState({ mode_state: 1 ,server_response:''})}
                    onClickChange={() => this.setState({ mode_state: 2,server_response:'' })}
                    onClickDelete={() => this.setState({ mode_state: 3,server_response:'' })}
                />
                {modeStateHtml(this.state.mode_state)}
            </div>
        );
    }
}

const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render(<Bookshelf />);
