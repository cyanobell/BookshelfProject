'use strict';
class Login extends React.Component {

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
      grecaptcha.execute('6LfNHdklAAAAALlnRMh61cbGSFmwb_UGj9qRPax1', { action: 'login' }).then(token => {
        let recaptchaResponse = document.getElementById('g-recaptcha-response');
        recaptchaResponse.value = token;
        this.setState({recaptchaResponse: recaptchaResponse});
        console.log(this.state);
      });
    });
  }

  render() {
    const handleSubmit = async (e) => {
      this.setState({submit_able: false});
      let send_data = { name: this.state.name, pass: this.state.password , recaptchaResponse: this.state.recaptchaResponse.value};
      e.preventDefault();

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(send_data),
        });

        const json = await response.json();
        console.log("res: " + json.text);
        if (json.text === 'user or password is wrong') {
          this.setState({ login_state_text: 'ログインに失敗しました' });
        } else if (json.text === 'captchaFailed') {
          this.setState({ login_state_text: 'reCAPTCHAの認証に失敗しました' });
        } else if (json.text === 'success') {
          location.href = '/home';
        }
      } catch (error) {
        console.error('エラーが発生しました', error);
      }
      this.setState({submit_able: true});
    }
    return (
      <div>
        <div>{this.state.login_state_text}</div>
        <form onSubmit={handleSubmit}>
          <div>ユーザー名<input type="text" name="username" value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })} /></div>
          <div>パスワード<input type="password" name="password" value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })} /></div>
            <input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response"></input>
            <div><input type="submit" name="login" disabled={!this.state.submit_able}/></div>
        </form>

      </div>
    );
  }
}

const root = document.getElementById('login');
ReactDOM.createRoot(root).render(<Login />);
 