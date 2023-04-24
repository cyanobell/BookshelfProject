'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var e = React.createElement;

var Register = function (_React$Component) {
    _inherits(Register, _React$Component);

    function Register(props) {
        _classCallCheck(this, Register);

        var _this = _possibleConstructorReturn(this, (Register.__proto__ || Object.getPrototypeOf(Register)).call(this, props));

        _this.state = {
            login_state_text: '',
            password: '',
            name: ''
        };
        return _this;
    }

    _createClass(Register, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var handleSubmit = function handleSubmit(e) {
                var send_data = { name: _this2.state.name, pass: _this2.state.password };
                fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(send_data)
                }).then(function (data) {
                    return data.json();
                }).then(function (json) {
                    if (json.text === 'The name is already registered.') {
                        _this2.setState({ login_state_text: 'その名前はすでに登録されています' });
                    } else if (json.text === 'success') {
                        location.href = '/home';
                    }
                });

                e.preventDefault();
            };

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    null,
                    this.state.login_state_text
                ),
                React.createElement(
                    'form',
                    { onSubmit: handleSubmit },
                    React.createElement(
                        'div',
                        null,
                        '\u30E6\u30FC\u30B6\u30FC\u540D',
                        React.createElement('input', { type: 'text', name: 'username', value: this.state.name,
                            onChange: function onChange(e) {
                                return _this2.setState({ name: e.target.value });
                            } })
                    ),
                    React.createElement(
                        'div',
                        null,
                        '\u30D1\u30B9\u30EF\u30FC\u30C9',
                        React.createElement('input', { type: 'password', name: 'password', value: this.state.password,
                            onChange: function onChange(e) {
                                return _this2.setState({ password: e.target.value });
                            } })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('input', { type: 'submit', name: 'register' })
                    )
                )
            );
        }
    }]);

    return Register;
}(React.Component);

var domContainer = document.querySelector('#register');
ReactDOM.render(React.createElement(Register, null), domContainer);