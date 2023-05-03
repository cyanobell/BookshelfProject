'use strict';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_state_text: '',
      password: '',
      name: '',
      submit_able: true,
      recaptchaResponse: null
    };
    grecaptcha.ready(() => {
      grecaptcha.execute('6LfNHdklAAAAALlnRMh61cbGSFmwb_UGj9qRPax1', {
        action: 'login'
      }).then(token => {
        let recaptchaResponse = document.getElementById('g-recaptcha-response');
        recaptchaResponse.value = token;
        this.setState({
          recaptchaResponse: recaptchaResponse
        });
        console.log(this.state);
      });
    });
  }
  render() {
    const handleSubmit = async e => {
      this.setState({
        submit_able: false
      });
      e.preventDefault();
      let send_data = {
        name: this.state.name,
        pass: this.state.password,
        recaptchaResponse: this.state.recaptchaResponse.value
      };
      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(send_data)
        });
        const json = await response.json();
        console.log("res: " + json.text);
        if (json.text === 'The name is already registered.') {
          this.setState({
            login_state_text: 'その名前はすでに登録されています'
          });
        } else if (json.text === 'captchaFailed') {
          this.setState({
            login_state_text: 'reCAPTCHAの認証に失敗しました'
          });
        } else if (json.text === 'success') {
          location.href = '/home';
        }
      } catch (error) {
        console.error('Error:', error);
      }
      this.setState({
        submit_able: true
      });
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
    })), /*#__PURE__*/React.createElement("input", {
      type: "hidden",
      name: "g-recaptcha-response",
      id: "g-recaptcha-response"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
      type: "submit",
      name: "register",
      disabled: !this.state.submit_able
    }))));
  }
}
const root = document.getElementById('register');
ReactDOM.createRoot(root).render( /*#__PURE__*/React.createElement(Register, null));