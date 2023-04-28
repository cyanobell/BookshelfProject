'use strict';
class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      login_state_text: '',
      password: '',
      name: ''
    };
  }

  render() {
    const handleSubmit = async (e) => {
      let send_data = { name: this.state.name, pass: this.state.password };
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
        } else if (json.text === 'success') {
          location.href = '/home';
        }
      } catch (error) {
        console.error('エラーが発生しました', error);
      }
    }
    return (
      <div>
        <div>{this.state.login_state_text}</div>
        <form onSubmit={handleSubmit}>
          <div>ユーザー名<input type="text" name="username" value={this.state.name}
            onChange={(e) => this.setState({ name: e.target.value })} /></div>
          <div>パスワード<input type="password" name="password" value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })} /></div>
          <div><input type="submit" name="login" /></div>
        </form>

      </div>
    );
  }
}

const root = document.getElementById('login');
ReactDOM.createRoot(root).render(<Login />);
