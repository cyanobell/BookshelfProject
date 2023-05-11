'use strict';
class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      login_state_text: '',
      password: '',
      name: '',
      server_response_waiting: false
    };
  }


  handleSubmit = async (e) => {
    this.setState({server_response_waiting: true});
    
    e.preventDefault();

    try {
      await new Promise(resolve => grecaptcha.ready(resolve));
      const recaptchaToken = await grecaptcha.execute('6LfNHdklAAAAALlnRMh61cbGSFmwb_UGj9qRPax1', { action: 'login' });
      let send_data = { name: this.state.name, pass: this.state.password , recaptchaToken: recaptchaToken};
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data),
      });

      if(response.ok){
        location.href = '/home';
        return;
      }
      const error_detail = await response.text();
      if (error_detail === 'user or password is wrong') {
        this.setState({ login_state_text: 'ログインに失敗しました' });
      } else if (error_detail=== 'reCaptchaFailed') {
        this.setState({ login_state_text: 'reCAPTCHAの認証に失敗しました' });
      } else if (error_detail === 'The name or pass is empty') {
        this.setState({ login_state_text: 'ユーザー名かパスワードが空です' });
      } else if (error_detail === 'input is wrong format') {
        this.setState({ login_state_text: '不正な入力がされました' });
      } else {
        this.setState({ login_state_text: 'サーバーエラーです 時間をおいて再接続してください' });
      }
    } catch (error) {
      console.error('エラーが発生しました', error);
    }
    this.setState({server_response_waiting: false});
  }

  getIsSubmitAble = () => {
    const name_min_length = 4;
    const name_max_length = 50;
    const pass_min_length = 4;
    const pass_max_length = 50;

    if ((this.state.name.length < name_min_length && this.state.name.length > name_max_length)
      && (this.state.password.length < pass_min_length && this.state.password.length > pass_max_length)) {
      return false;
    }
    return !this.state.server_response_waiting;
  }

  render() {
    return (
      <div>
        <h2>ログイン</h2>
        <div>{this.state.login_state_text}</div>
        <form onSubmit={this.handleSubmit}>
          <div>ユーザー名<input type="text" name="username" value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })} maxLength="50" /></div>
          <div>パスワード<input type="password" name="password" value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })} maxLength="50" /></div>
            <input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response"></input>
            <div><input type="submit" name="login" disabled={!this.getIsSubmitAble()}/></div>
        </form>
      </div>
    );
  }
}

const root = document.getElementById('login');
ReactDOM.createRoot(root).render(<Login />);
 