'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var e = React.createElement;

function getBookJson(isbn) {
    var url = "https://api.openbd.jp/v1/get?isbn=" + isbn;
    return fetch(url).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data && data[0]) {
            console.log("call isbn api success");
            return data[0];
        } else {
            return { summary: { title: "本の情報を取得できませんでした。isbn:" + isbn } };
        }
    }).catch(function (error) {
        console.error("Error occurred while fetching book data:", error);
        return { summary: { title: "本の情報を取得できませんでした。isbn:" + isbn } };
    });
}
function BookButton(props) {
    React.createElement(
        "button",
        { onClick: function onClick() {
                return props.onClick(book);
            } },
        props.bookButtonText()
    );
}

function ShowBooks(_ref) {
    var books = _ref.books,
        bookDetails = _ref.bookDetails,
        bookButton = _ref.bookButton;

    if (books.length === 0) {
        return React.createElement(
            "div",
            null,
            "\u672C\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002"
        );
    }

    if (bookDetails.length === 0) {
        return React.createElement(
            "div",
            null,
            "\u60C5\u5831\u3092\u53D6\u5F97\u4E2D\u3067\u3059\u3002"
        );
    }
    var readStateText = function readStateText(read_state) {
        switch (read_state) {
            case 0:
                return "未読";
            case 1:
                return "読み止し";
            case 2:
                return "読了";
        }
    };
    var listItems = books.map(function (book, index) {
        if (bookDetails.length > index) {
            return React.createElement(
                "tbody",
                { key: book.id },
                React.createElement(
                    "tr",
                    { className: "bookDetails" },
                    React.createElement(
                        "td",
                        null,
                        bookDetails[index].summary.title
                    ),
                    React.createElement(
                        "td",
                        null,
                        React.createElement("img", { src: bookDetails[index].summary.cover,
                            alt: "book_image", width: "100", height: " auto" })
                    ),
                    React.createElement(
                        "td",
                        null,
                        ":"
                    ),
                    React.createElement(
                        "td",
                        null,
                        readStateText(book.read_state)
                    ),
                    React.createElement(
                        "td",
                        null,
                        bookButton(index)
                    )
                )
            );
        } else {
            return React.createElement(
                "tbody",
                { key: book.id },
                React.createElement(
                    "tr",
                    { className: "bookDetails" },
                    React.createElement("td", null)
                )
            );
        }
    });

    return React.createElement(
        "table",
        null,
        listItems
    );
}

var BookShowState = function (_React$Component) {
    _inherits(BookShowState, _React$Component);

    function BookShowState(props) {
        _classCallCheck(this, BookShowState);

        var _this = _possibleConstructorReturn(this, (BookShowState.__proto__ || Object.getPrototypeOf(BookShowState)).call(this, props));

        _this.state = {
            index: -1
        };
        return _this;
    }

    _createClass(BookShowState, [{
        key: "ShowBookDetail",
        value: function ShowBookDetail(bookDetail) {
            //いい感じにする
            console.log(bookDetail);

            var bookCollateralDetailHtml = void 0;
            if (bookDetail.onix) {
                bookCollateralDetailHtml = bookDetail.onix.CollateralDetail.TextContent.map(function (textContent, index) {
                    return React.createElement(
                        "p",
                        { key: index },
                        textContent.Text
                    );
                });
            }
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "h2",
                    null,
                    bookDetail.summary.title
                ),
                React.createElement("img", { src: bookDetail.summary.cover, alt: "book_image", width: "300", height: " auto" }),
                React.createElement(
                    "p",
                    null,
                    bookDetail.summary.author
                ),
                React.createElement(
                    "div",
                    null,
                    bookCollateralDetailHtml
                )
            );
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                books = _props.books,
                bookDetails = _props.bookDetails;

            var bookDetailHtml = void 0;
            var bookButton = function bookButton(index) {
                return React.createElement(
                    "button",
                    { type: "submit", onClick: function onClick() {
                            return _this2.setState({ index: index });
                        }, disabled: bookDetails[index].onix === undefined },
                    "\u8A73\u7D30\u3092\u898B\u308B"
                );
            };
            //詳細を見るボタンが押されたら、その本の詳細を表示　
            if (this.state.index !== -1) {
                bookDetailHtml = this.ShowBookDetail(bookDetails[this.state.index]);
            }
            return React.createElement(
                "div",
                null,
                React.createElement("hr", null),
                bookDetailHtml,
                React.createElement("hr", null),
                React.createElement(ShowBooks, {
                    books: books,
                    bookButton: bookButton,
                    bookDetails: bookDetails
                })
            );
        }
    }]);

    return BookShowState;
}(React.Component);

;

function IsbnInputArea(_ref2) {
    var inputingIsbn = _ref2.inputingIsbn,
        inputOnChange = _ref2.inputOnChange,
        submitOnClick = _ref2.submitOnClick;

    return React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
            "div",
            null,
            "ISBN\u30B3\u30FC\u30C9",
            React.createElement("input", { type: "text", name: "isbn", value: inputingIsbn,
                inputMode: "numeric",
                onChange: inputOnChange }),
            " "
        ),
        React.createElement(
            "button",
            { type: "submit", onClick: submitOnClick },
            "Add"
        )
    );
}

function BookAddState(_ref3) {
    var inputingIsbn = _ref3.inputingIsbn,
        submitOnClick = _ref3.submitOnClick,
        inputOnChange = _ref3.inputOnChange,
        books = _ref3.books,
        bookDetails = _ref3.bookDetails;

    return React.createElement(
        "div",
        null,
        React.createElement("hr", null),
        React.createElement(IsbnInputArea, {
            inputingIsbn: inputingIsbn,
            submitOnClick: submitOnClick,
            inputOnChange: inputOnChange }),
        React.createElement("hr", null),
        React.createElement(ShowBooks, {
            books: books,
            bookDetails: bookDetails,
            bookButton: function bookButton(id) {
                return "";
            }
        })
    );
}

function BookReadingChangeState(_ref4) {
    var books = _ref4.books,
        bookDetails = _ref4.bookDetails,
        changeReadState = _ref4.changeReadState;

    var bookButton = function bookButton(index) {
        return React.createElement(
            "button",
            { type: "submit", onClick: function onClick() {
                    return changeReadState(index);
                } },
            "\u8AAD\u66F8\u72B6\u614B\u5909\u66F4"
        );
    };
    return React.createElement(
        "div",
        null,
        React.createElement(ShowBooks, {
            books: books,
            bookDetails: bookDetails,
            bookButton: bookButton
        })
    );
}

function BookDeleteState(_ref5) {
    var books = _ref5.books,
        bookDetails = _ref5.bookDetails,
        deleteBook = _ref5.deleteBook;

    var bookButton = function bookButton(index) {
        return React.createElement(
            "button",
            { type: "submit", onClick: function onClick() {
                    return deleteBook(index);
                } },
            "\u672C\u3092\u524A\u9664"
        );
    };
    return React.createElement(
        "div",
        null,
        React.createElement(ShowBooks, {
            books: books,
            bookDetails: bookDetails,
            bookButton: bookButton
        })
    );
}

function ModeSelecter(props) {
    return React.createElement(
        "div",
        { className: "form-group" },
        React.createElement("input", { type: "radio", name: "ModeSelecter", onClick: props.onClickShow, defaultChecked: true }),
        "\u95B2\u89A7\u30E2\u30FC\u30C9",
        React.createElement("input", { type: "radio", name: "ModeSelecter", onClick: props.onClickAdd }),
        "\u66F8\u7C4D\u8FFD\u52A0\u30E2\u30FC\u30C9",
        React.createElement("input", { type: "radio", name: "ModeSelecter", onClick: props.onClickChange }),
        "\u8AAD\u66F8\u30B9\u30C6\u30FC\u30C8\u5909\u66F4\u30E2\u30FC\u30C9",
        React.createElement("input", { type: "radio", name: "ModeSelecter", onClick: props.onClickDelete }),
        "\u66F8\u7C4D\u524A\u9664\u30E2\u30FC\u30C9"
    );
}

var Bookshelf = function (_React$Component2) {
    _inherits(Bookshelf, _React$Component2);

    ///this class Call API
    function Bookshelf(props) {
        _classCallCheck(this, Bookshelf);

        var _this3 = _possibleConstructorReturn(this, (Bookshelf.__proto__ || Object.getPrototypeOf(Bookshelf)).call(this, props));

        _this3.state = {
            server_response: '',
            inputingIsbn: '',
            books: [],
            bookDetails: [],
            mode_state: 0
        };
        _this3.loadIsbn();
        return _this3;
    }

    _createClass(Bookshelf, [{
        key: "addBookDetails",
        value: function addBookDetails(book) {
            var _this4 = this;

            if (!book) {
                return;
            }
            getBookJson(book.isbn).then(function (newBookDetail) {
                _this4.setState({ bookDetails: _this4.state.bookDetails.concat([newBookDetail]) });
            });
        }
    }, {
        key: "loadIsbn",
        value: function loadIsbn() {
            var _this5 = this;

            fetch('/api/get_have_books', {
                method: 'POST'
            }).then(function (data) {
                return data.json();
            }).then(function (books) {
                console.log(books);
                _this5.setState({ books: _this5.state.books.concat(books) });
                books.forEach(function (book) {
                    _this5.addBookDetails(book);
                });
            });
        }
    }, {
        key: "registerIsbn",
        value: function registerIsbn(inputingIsbn) {
            var _this6 = this;

            if (inputingIsbn.length === 0) {
                this.setState({ server_response: '入力欄が空です。' });
                return;
            }
            var send_data = { isbn: inputingIsbn };
            fetch('/api/register_book', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(send_data)
            }).then(function (data) {
                return data.json();
            }).then(function (json) {
                if (json.text === 'success') {
                    _this6.setState({ server_response: '登録できました！' });
                    _this6.setState({ inputingIsbn: '' });
                    _this6.setState({ books: _this6.state.books.concat([json.book]) });
                    _this6.addBookDetails(json.book);
                } else if (json.text === 'already registered') {
                    _this6.setState({ server_response: 'その本はすでに登録されています。' });
                } else if (json.text === 'isbn is too old or wrong.') {
                    _this6.setState({ server_response: 'ISBNコードが間違っているか、対応していない形式です。' });
                } else {
                    _this6.setState({ server_response: 'サーバーエラーです。登録できませんでした。' });
                }
            });
        }
    }, {
        key: "changeReadState",
        value: function changeReadState(index, new_read_state) {
            var _this7 = this;

            var send_data = { book: this.state.books[index], new_read_state: new_read_state };
            fetch('/api/change_read_state', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(send_data)
            }).then(function (data) {
                return data.json();
            }).then(function (json) {
                console.log(json.text);
                if (json.text === 'success') {
                    _this7.setState({ server_response: '変更できました！' });
                    _this7.setState({ inputingIsbn: '' });
                    var books = _this7.state.books;

                    var newBooks = [].concat(_toConsumableArray(books));
                    newBooks[index] = Object.assign({}, books[index], { read_state: new_read_state });
                    _this7.setState({ books: newBooks });
                } else {
                    _this7.setState({ server_response: 'サーバーエラーです。登録できませんでした。' });
                }
            });
        }
    }, {
        key: "deleteBook",
        value: function deleteBook(index) {
            var _this8 = this;

            var send_data = { book: this.state.books[index] };
            fetch('/api/delete_book', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(send_data)
            }).then(function (data) {
                return data.json();
            }).then(function (json) {
                console.log(json.text);
                if (json.text === 'success') {
                    _this8.setState({ server_response: _this8.state.bookDetails[index].summary.title + ' を削除しました。' });
                    _this8.setState({
                        books: _this8.state.books.filter(function (book, findex) {
                            return findex !== index;
                        }),
                        bookDetails: _this8.state.bookDetails.filter(function (bookDetail, findex) {
                            return findex !== index;
                        })
                    });
                } else {
                    _this8.setState({ server_response: 'サーバーエラーです。登録できませんでした。' });
                }
            });
        }
    }, {
        key: "render",

        // 
        value: function render() {
            var _this9 = this;

            var modeStateHtml = function modeStateHtml(mode_state) {
                switch (mode_state) {
                    case 0:
                        return React.createElement(BookShowState, {
                            books: _this9.state.books,
                            bookDetails: _this9.state.bookDetails
                        });
                    case 1:
                        return React.createElement(BookAddState, {
                            inputingIsbn: _this9.state.inputingIsbn,
                            submitOnClick: function submitOnClick() {
                                return _this9.registerIsbn(_this9.state.inputingIsbn);
                            },
                            inputOnChange: function inputOnChange(e) {
                                _this9.setState({ inputingIsbn: e.target.value.replace(/[^0-9]/g, "") });
                            },
                            books: _this9.state.books,
                            bookDetails: _this9.state.bookDetails
                        });
                    case 2:
                        return React.createElement(BookReadingChangeState, {
                            books: _this9.state.books,
                            bookDetails: _this9.state.bookDetails,
                            changeReadState: function changeReadState(index) {
                                var read_state = _this9.state.books[index].read_state;
                                var new_read_state = read_state < 2 ? read_state + 1 : 0;
                                _this9.changeReadState(index, new_read_state);
                            }
                        });
                    case 3:
                        return React.createElement(BookDeleteState, {
                            books: _this9.state.books,
                            bookDetails: _this9.state.bookDetails,
                            deleteBook: function deleteBook(index) {
                                _this9.deleteBook(index);
                            }
                        });
                }
            };

            return React.createElement(
                "div",
                { className: "Bookshelf" },
                React.createElement(
                    "div",
                    { className: "ServerResponse" },
                    this.state.server_response
                ),
                React.createElement(ModeSelecter, {
                    mode_state: this.state.mode_state,
                    onClickShow: function onClickShow() {
                        return _this9.setState({ mode_state: 0 });
                    },
                    onClickAdd: function onClickAdd() {
                        return _this9.setState({ mode_state: 1 });
                    },
                    onClickChange: function onClickChange() {
                        return _this9.setState({ mode_state: 2 });
                    },
                    onClickDelete: function onClickDelete() {
                        return _this9.setState({ mode_state: 3 });
                    }
                }),
                modeStateHtml(this.state.mode_state)
            );
        }
    }]);

    return Bookshelf;
}(React.Component);

var root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render(React.createElement(Bookshelf, null));