'use strict';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_state_text: '',
      password: '',
      name: ''
    };
  }
  render() {
    const handleSubmit = e => {
      let send_data = {
        name: this.state.name,
        pass: this.state.password
      };
      fetch('/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      }).then(data => data.json()).then(json => {
        if (json.text === 'The name is already registered.') {
          this.setState({
            login_state_text: 'その名前はすでに登録されています'
          });
        } else if (json.text === 'success') {
          location.href = '/home';
        }
      });
      e.preventDefault();
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, this.state.login_state_text), /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit
    }, /*#__PURE__*/React.createElement("div", null, "\u30E6\u30FC\u30B6\u30FC\u540D", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "username",
      value: this.state.name,
      onChange: e => this.setState({
        name: e.target.value
      })
    })), /*#__PURE__*/React.createElement("div", null, "\u30D1\u30B9\u30EF\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
      type: "password",
      name: "password",
      value: this.state.password,
      onChange: e => this.setState({
        password: e.target.value
      })
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
      type: "submit",
      name: "register"
    }))));
  }
}
const root = document.getElementById('register');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Register, null));