'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
    return React.createElement(
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

            var path = window.location.pathname;
            var shared_id = path.split('/')[2];
            fetch("/api/get_shared_books/" + shared_id, {
                method: 'GET'
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
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "Bookshelf" },
                React.createElement(
                    "div",
                    { className: "ServerResponse" },
                    this.state.server_response
                ),
                React.createElement(BookShowState, {
                    books: this.state.books,
                    bookDetails: this.state.bookDetails
                })
            );
        }
    }]);

    return Bookshelf;
}(React.Component);

var root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render(React.createElement(Bookshelf, null));