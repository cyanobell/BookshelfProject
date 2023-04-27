'use strict';
const e = React.createElement;
function checkIsValidISBN(isbn) {
    if (isbn === null) {
        return false;
    }
    const isbn_str = isbn.toString();
    //現状古い規格は非対応
    if (isbn_str.length != 13) {
        return false;
    }
    //現状古い規格は非対応
    if (isbn_str[0] != '9' && isbn_str[1] != '7') {
        return false;
    }
    const check_digit = parseInt(isbn_str.slice(-1)); // バーコードからチェックディジットを抽出する
    const barcode_digits = isbn_str.slice(0, -1).split(""); // チェックディジットを除いたバーコードの桁を抽出する

    //チェックデジットと照らし合わせる数字を生成
    let sum = 0;
    for (let i = 0; i < barcode_digits.length; i++) {
        if (i % 2 === 0) {
            sum += parseInt(barcode_digits[i]); // 奇数桁を足す
        } else {
            sum += 3 * parseInt(barcode_digits[i]); // 偶数桁を3倍する
        }
    }

    //チェックデジットと照らし合わせる
    if ((sum + check_digit) % 10 === 0) {
        return true;
    } else {
        console.log("Barcode error: " + sum + check_digit);
        return false;
    }
}

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

class BarcodeReader extends React.Component {
    //todo:カメラ切り替え機能の追加
    //todo:バーコード読み取りAPIの対応幅を広げる
    constructor(props) {
        super(props);
        this.state = {
            imgSrc: null,
            readedIsbnValue:null
        };
        this.videoRef = React.createRef();
        this.video = { width: 640, height: 480 };
    }

    async detectBarcodes(imageData) {
        try {
            let barcodes = [];
            if (typeof BarcodeDetector === "function") {
                const barcodeDetector = new BarcodeDetector();
                barcodes = await barcodeDetector.detect(imageData);
            }
            //todo:ブラウザがBarcodeDetectorに対応していない場合、別の方法を試す。
            if (barcodes.length > 0) {
                return barcodes;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    
    async detectIsbnCode(imageData) {
        try {
            let barcodes = await this.detectBarcodes(imageData);
            if (barcodes && barcodes.length > 0) {
                for (const barcode of barcodes) {
                    if (checkIsValidISBN(barcode.rawValue)) {
                        return barcode.rawValue;
                    }
                }
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getCameraStream() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            let cameraId = null;
            devices.forEach((device) => {
                if (device.kind === "videoinput" && device.facingMode === "environment") {
                    cameraId = device.deviceId;
                }
            });
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraId } });
            return stream;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async componentDidMount() {
        const stream = await this.getCameraStream();
        this.videoRef.current.srcObject = stream;
        this.videoRef.current.play();
        const canvas = document.createElement("canvas");
        canvas.width = this.video.width;
        canvas.height = this.video.height;
        console.log(canvas);
        console.log(this.videoRef.current.videoWidth);
        const context = canvas.getContext("2d");
        setInterval(async () => {
            context.drawImage(this.videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            console.log(imageData);
            const readed_isbn = await this.detectIsbnCode(imageData);
            if (readed_isbn) {
                this.setState({ readedIsbnValue: readed_isbn });
            }
        }, 1000 / 30);
    }

    render() {
        const { onReadSuccess } = this.props;
        if (this.state.readedIsbnValue) {
            onReadSuccess(this.state.readedIsbnValue);
        }
        return (
            <div>
                <div
                    style={{
                        border: "1px solid black",
                        width: `${this.video.width}px`,
                        height: `${this.video.height}px`,
                        marginBottom: "16px",
                    }}
                >
                    {<video
                        ref={this.videoRef}
                        style={{
                            objectFit: "contain",
                            width: "100%",
                            height: "100%",
                        }}
                    />}
                </div>
            </div >
        );
    }
}

class IsbnInputArea extends React.Component {
    //todo:バーコード読み取り中止機能をつける
    //todo:バーコード読み取り/入力完了時、登録する本をプレビューする機能追加
    constructor(props) {
        super(props);

        this.state = {
            showBarcodeReader: false,
        };
    }

    render() {
        const { showBarcodeReader } = this.state;
        const { inputingIsbn, inputOnChange, onBarcodeReadSuccess, submitOnClick } = this.props;
        return (
            <div className="form-group">
                <div>ISBNコード
                    <input type="text" name="isbn" value={inputingIsbn}
                        inputMode="numeric"
                        onChange={inputOnChange} />
                </div>
                {showBarcodeReader && <BarcodeReader onReadSuccess={(code) => { onBarcodeReadSuccess(code); this.setState({ showBarcodeReader: false }) }} />}
                {!showBarcodeReader && <button type="button" onClick={() => this.setState({ showBarcodeReader: true })}>バーコード読み取り</button>}
                <button type="submit" onClick={submitOnClick}>追加</button>
            </div>
        );
    }
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
                    submitOnClick={() => { submitOnClick(this.state.inputingIsbn); this.setState({ inputingIsbn: "" }); }}
                    onBarcodeReadSuccess={(barcode) => { this.setState({ inputingIsbn: barcode }); }}
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
        return (<button onClick={() => changeReadState(index)}>読書状態変更</button>);
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
        return (<button onClick={() => deleteBook(index)}>本を削除</button>);
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
            this.setState({ server_response: 'サーバーエラーが発生しました。' });
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
            this.setState({ server_response: 'サーバーエラーが発生しました。' });
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
            this.setState({ server_response: 'サーバーエラーが発生しました。' });
        }
    }

    async shareUrlCopyToCrip() {
        try {
            const response = await fetch(`/api/get_user_id`, {
                method: 'GET',
            })
            const json = await response.json();
            console.log(json.user_id);
            const shareUrl = `${window.location.origin}/shared_books/${json.user_id}`;
            navigator.clipboard.writeText(shareUrl).then(
                () => {
                    this.setState({ server_response: 'クリップボードに共有用URLをコピーしました。' });
                },
                () => {
                    this.setState({ server_response: 'URL: ' + shareUrl });
                });
        } catch (error) {
            this.setState({ server_response: 'サーバーエラーが発生しました。' });
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
                <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'right', padding: 10 }}>
                    <button onClick={() => this.shareUrlCopyToCrip()} >本棚を共有</button>
                    <button onClick={() => location.href = '/logout'}>ログアウト</button>
                </div>
                <div className="ServerResponse">{this.state.server_response}</div>
                <hr></hr>
                <ModeSelecter
                    mode_state={this.state.mode_state}
                    onClickShow={() => this.setState({ mode_state: 0, server_response: '' })}
                    onClickAdd={() => this.setState({ mode_state: 1, server_response: '' })}
                    onClickChange={() => this.setState({ mode_state: 2, server_response: '' })}
                    onClickDelete={() => this.setState({ mode_state: 3, server_response: '' })}
                />
                {modeStateHtml(this.state.mode_state)}
            </div>
        );
    }
}

const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render(<Bookshelf />);
