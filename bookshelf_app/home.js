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
      return {
        summary: {
          title: "本の情報を取得できませんでした。isbn:" + isbn
        }
      };
    }
  } catch (error) {
    console.error("Error occurred while fetching book data:", error);
    return {
      summary: {
        title: "本のデータを取得中にエラーが発生しました isbn:" + isbn
      }
    };
  }
}
function BookButton(props) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => props.onClick(book)
  }, props.bookButtonText());
}
function ShowBooks({
  books,
  bookButton
}) {
  if (books.length === 0) {
    return /*#__PURE__*/React.createElement("div", null, "\u672C\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002");
  }
  const readStateText = read_state => {
    switch (read_state) {
      case 0:
        return "未読";
      case 1:
        return "読み止し";
      case 2:
        return "読了";
    }
  };
  const listItems = books.map((book, index) => {
    if (book.detail !== undefined) {
      return /*#__PURE__*/React.createElement("tbody", {
        key: book.id
      }, /*#__PURE__*/React.createElement("tr", {
        className: "bookDetail"
      }, /*#__PURE__*/React.createElement("td", null, book.detail.summary.title), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("img", {
        src: book.detail.summary.cover,
        alt: "book_image",
        width: "100",
        height: " auto"
      })), /*#__PURE__*/React.createElement("td", null, ":"), /*#__PURE__*/React.createElement("td", null, readStateText(book.read_state)), /*#__PURE__*/React.createElement("td", null, bookButton(index))));
    } else {
      return /*#__PURE__*/React.createElement("tbody", {
        key: book.id
      }, /*#__PURE__*/React.createElement("tr", {
        className: "bookDetails"
      }, /*#__PURE__*/React.createElement("td", null)));
    }
  });
  return /*#__PURE__*/React.createElement("table", null, listItems);
}
class BookShowState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: -1
    };
  }
  ShowBookDetail(bookDetail) {
    let bookCollateralDetailHtml;
    if (bookDetail.onix) {
      bookCollateralDetailHtml = bookDetail.onix.CollateralDetail.TextContent.map((textContent, index) => /*#__PURE__*/React.createElement("p", {
        key: index
      }, textContent.Text));
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, bookDetail.summary.title), /*#__PURE__*/React.createElement("img", {
      src: bookDetail.summary.cover,
      alt: "book_image",
      width: "300",
      height: " auto"
    }), /*#__PURE__*/React.createElement("p", null, bookDetail.summary.author), /*#__PURE__*/React.createElement("div", null, bookCollateralDetailHtml), /*#__PURE__*/React.createElement("hr", null));
  }
  render() {
    let {
      books
    } = this.props;
    let bookDetailHtml;
    const bookButton = index => {
      return /*#__PURE__*/React.createElement("button", {
        onClick: () => this.setState({
          index: index
        }),
        disabled: books[index].detail.onix === undefined
      }, "\u8A73\u7D30\u3092\u898B\u308B");
    };
    //詳細を見るボタンが押されたら、その本の詳細を表示　
    if (this.state.index !== -1) {
      bookDetailHtml = this.ShowBookDetail(books[this.state.index].detail);
    }
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), bookDetailHtml, /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: bookButton
    }));
  }
}
;
class PlayCamera extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDeviceIndex: 0,
      devices: [],
      stream: null
    };
    this.videoRef = React.createRef();
    this.handleCameraChange = this.handleCameraChange.bind(this);
  }
  async componentDidMount() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      this.setState({
        devices: videoDevices
      });
      if (videoDevices.length > 0) {
        await this.startCamera(videoDevices[this.state.currentDeviceIndex].deviceId);
      }
      this.captureImage();
    } catch (error) {
      console.error(error);
    }
  }
  async componentWillUnmount() {
    await this.stopCamera();
  }
  async startCamera(deviceId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId
        }
      });
      this.videoRef.current.srcObject = stream;
      await this.videoRef.current.play();
      this.setState({
        stream
      });
    } catch (error) {
      console.error(error);
    }
  }
  async stopCamera() {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
      this.setState({
        stream: null
      });
    }
  }
  async handleCameraChange() {
    const {
      currentDeviceIndex,
      devices
    } = this.state;
    const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
    await this.stopCamera();
    await this.startCamera(devices[nextDeviceIndex].deviceId);
    this.captureImage();
    this.setState({
      currentDeviceIndex: nextDeviceIndex
    });
  }
  captureImage = () => {
    if (!this.videoRef.current || this.videoRef.current.videoWidth === 0 || this.videoRef.current.videoHeight === 0) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = this.videoRef.current.videoWidth;
    canvas.height = this.videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.props.onReading(imageData);
    window.requestAnimationFrame(this.captureImage);
  };
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "barcode-reader"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid black",
        width: `${this.props.width}px`,
        height: `${this.props.height}px`,
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement("video", {
      ref: this.videoRef,
      style: {
        objectFit: "contain",
        width: "100%",
        height: "100%"
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: this.handleCameraChange
    }, "\u30AB\u30E1\u30E9\u5909\u66F4"));
  }
}
class BarcodeReader extends React.Component {
  //todo:バーコード読み取りAPIの対応幅を広げる
  constructor(props) {
    super(props);
    this.state = {
      imgSrc: null,
      readedIsbnValue: null
    };
    this.video = {
      width: 640,
      height: 480
    };
    this.videoHTML = /*#__PURE__*/React.createElement(React.Fragment, null);
    this.detectIsbnCode = this.detectIsbnCode.bind(this);
    if (typeof BarcodeDetector === "function") {
      this.videoHTML = /*#__PURE__*/React.createElement(PlayCamera, {
        onReading: this.detectIsbnCode,
        width: this.video.width,
        height: this.video.height
      });
    } else {
      this.videoHTML = /*#__PURE__*/React.createElement("div", null, "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u306F\u3001\u30D0\u30FC\u30B3\u30FC\u30C9\u306E\u8AAD\u307F\u53D6\u308A\u306B\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093");
    }
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
            this.setState({
              readedIsbnValue: barcode.rawValue
            });
          }
        }
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  render() {
    const {
      onReadSuccess
    } = this.props;
    if (this.state.readedIsbnValue) {
      onReadSuccess(this.state.readedIsbnValue);
    }
    return /*#__PURE__*/React.createElement("div", null, this.videoHTML);
  }
}
class IsbnInputArea extends React.Component {
  //todo:バーコード読み取り/入力完了時、登録する本をプレビューする機能追加
  constructor(props) {
    super(props);
    this.state = {
      showBarcodeReader: false
    };
  }
  render() {
    const {
      showBarcodeReader
    } = this.state;
    const {
      inputingIsbn,
      inputOnChange,
      onBarcodeReadSuccess,
      submitOnClick
    } = this.props;
    return /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("div", null, "ISBN\u30B3\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "isbn",
      value: inputingIsbn,
      inputMode: "numeric",
      onChange: inputOnChange
    })), showBarcodeReader && /*#__PURE__*/React.createElement(BarcodeReader, {
      onReadSuccess: code => {
        onBarcodeReadSuccess(code);
        this.setState({
          showBarcodeReader: false
        });
      }
    }), !showBarcodeReader && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => this.setState({
        showBarcodeReader: true
      })
    }, "\u30D0\u30FC\u30B3\u30FC\u30C9\u8AAD\u307F\u53D6\u308A"), showBarcodeReader && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => this.setState({
        showBarcodeReader: false
      })
    }, "\u8AAD\u307F\u53D6\u308A\u4E2D\u6B62"), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      onClick: submitOnClick
    }, "\u8FFD\u52A0"));
  }
}
class BookAddState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputingIsbn: ""
    };
  }
  render() {
    const {
      submitOnClick,
      books
    } = this.props;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(IsbnInputArea, {
      inputingIsbn: this.state.inputingIsbn,
      submitOnClick: () => {
        submitOnClick(this.state.inputingIsbn);
        this.setState({
          inputingIsbn: ""
        });
      },
      onBarcodeReadSuccess: barcode => {
        this.setState({
          inputingIsbn: barcode
        });
      },
      inputOnChange: e => {
        this.setState({
          inputingIsbn: e.target.value.replace(/[^0-9]/g, "")
        });
      }
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: id => ""
    }));
  }
}
function BookReadingChangeState({
  books,
  changeReadState
}) {
  const bookButton = index => {
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => changeReadState(index)
    }, "\u8AAD\u66F8\u72B6\u614B\u5909\u66F4");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ShowBooks, {
    books: books,
    bookButton: bookButton
  }));
}
function BookDeleteState({
  books,
  deleteBook
}) {
  const bookButton = index => {
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => deleteBook(index)
    }, "\u672C\u3092\u524A\u9664");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ShowBooks, {
    books: books,
    bookButton: bookButton
  }));
}
function ModeSelecter(props) {
  return /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ModeSelecter",
    onClick: props.onClickShow,
    defaultChecked: true
  }), "\u95B2\u89A7\u30E2\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ModeSelecter",
    onClick: props.onClickAdd
  }), "\u66F8\u7C4D\u8FFD\u52A0\u30E2\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ModeSelecter",
    onClick: props.onClickChange
  }), "\u8AAD\u66F8\u30B9\u30C6\u30FC\u30C8\u5909\u66F4\u30E2\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "ModeSelecter",
    onClick: props.onClickDelete
  }), "\u66F8\u7C4D\u524A\u9664\u30E2\u30FC\u30C9");
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
        method: 'GET'
      });
      const books = await response.json();
      for (const book of books) {
        book.detail = await getBookJson(book.isbn);
      }
      this.setState({
        books: books
      });
    } catch (error) {
      console.error(error);
    }
  }
  async registerIsbn(inputingIsbn) {
    try {
      if (inputingIsbn.length === 0) {
        this.setState({
          server_response: '入力欄が空です。'
        });
        return;
      }
      let send_data = {
        isbn: inputingIsbn
      };
      const response = await fetch('/api/register_book', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      const json = await response.json();
      if (json.text === 'success') {
        this.setState({
          server_response: '登録できました！'
        });
        this.setState({
          inputingIsbn: ''
        });
        json.book.detail = await getBookJson(json.book.isbn);
        this.setState({
          books: this.state.books.concat([json.book])
        });
      } else if (json.text === 'already registered') {
        this.setState({
          server_response: 'その本はすでに登録されています。'
        });
      } else if (json.text === 'isbn is too old or wrong.') {
        this.setState({
          server_response: 'ISBNコードが間違っているか、対応していない形式です。'
        });
      } else {
        this.setState({
          server_response: 'サーバーエラーです。登録できませんでした。'
        });
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  }
  async changeReadState(index, new_read_state) {
    try {
      let send_data = {
        book: this.state.books[index],
        new_read_state: new_read_state
      };
      const response = await fetch('/api/change_read_state', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      const json = await response.json();
      console.log(json.text);
      if (json.text === 'success') {
        this.setState({
          server_response: '変更できました！'
        });
        this.setState({
          inputingIsbn: ''
        });
        const {
          books
        } = this.state;
        const newBooks = [...books];
        newBooks[index] = {
          ...books[index],
          read_state: new_read_state
        };
        this.setState({
          books: newBooks
        });
      } else {
        this.setState({
          server_response: 'サーバーエラーです。登録できませんでした。'
        });
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  }
  async deleteBook(index) {
    try {
      let send_data = {
        book: this.state.books[index]
      };
      const response = await fetch('/api/delete_book', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      const json = await response.json();
      console.log(json.text);
      if (json.text === 'success') {
        this.setState({
          server_response: this.state.books[index].detail.summary.title + ' を削除しました。'
        });
        this.setState({
          books: this.state.books.filter((book, findex) => findex !== index)
        });
      } else {
        this.setState({
          server_response: 'サーバーエラーです。登録できませんでした。'
        });
      }
    } catch (error) {
      console.error(error);
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  }
  async shareUrlCopyToCrip() {
    try {
      const response = await fetch(`/api/get_user_id`, {
        method: 'GET'
      });
      const json = await response.json();
      console.log(json.user_id);
      const shareUrl = `${window.location.origin}/shared_books/${json.user_id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.setState({
          server_response: 'クリップボードに共有用URLをコピーしました。'
        });
      }, () => {
        this.setState({
          server_response: 'URL: ' + shareUrl
        });
      });
    } catch (error) {
      this.setState({
        server_response: 'サーバーエラーが発生しました。'
      });
    }
  }
  render() {
    const modeStateHtml = mode_state => {
      switch (mode_state) {
        case 0:
          return /*#__PURE__*/React.createElement(BookShowState, {
            books: this.state.books
          });
        case 1:
          return /*#__PURE__*/React.createElement(BookAddState, {
            submitOnClick: inputedIsbn => this.registerIsbn(inputedIsbn),
            books: this.state.books
          });
        case 2:
          return /*#__PURE__*/React.createElement(BookReadingChangeState, {
            books: this.state.books,
            changeReadState: index => {
              let read_state = this.state.books[index].read_state;
              let new_read_state = read_state < 2 ? read_state + 1 : 0;
              this.changeReadState(index, new_read_state);
            }
          });
        case 3:
          return /*#__PURE__*/React.createElement(BookDeleteState, {
            books: this.state.books,
            deleteBook: index => {
              this.deleteBook(index);
            }
          });
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "Bookshelf"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        textAlign: 'right',
        padding: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => this.shareUrlCopyToCrip()
    }, "\u672C\u68DA\u3092\u5171\u6709"), /*#__PURE__*/React.createElement("button", {
      onClick: () => location.href = '/logout'
    }, "\u30ED\u30B0\u30A2\u30A6\u30C8")), /*#__PURE__*/React.createElement("div", {
      className: "ServerResponse"
    }, this.state.server_response), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ModeSelecter, {
      mode_state: this.state.mode_state,
      onClickShow: () => this.setState({
        mode_state: 0,
        server_response: ''
      }),
      onClickAdd: () => this.setState({
        mode_state: 1,
        server_response: ''
      }),
      onClickChange: () => this.setState({
        mode_state: 2,
        server_response: ''
      }),
      onClickDelete: () => this.setState({
        mode_state: 3,
        server_response: ''
      })
    }), modeStateHtml(this.state.mode_state));
  }
}
const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Bookshelf, null));