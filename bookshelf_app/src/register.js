'use strict';
const e = React.createElement;
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
        const handleSubmit = (e) => {
            let send_data = { name: this.state.name, pass: this.state.password };
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(send_data),
            })
                .then((data) => data.json())
                .then((json) => {
                    if (json.text === 'The name is already registered.') {
                        this.setState({ login_state_text: 'その名前はすでに登録されています' });
                    } else if (json.text === 'success') {
                        location.href = '/home';
                    }
                });

            e.preventDefault();
        };

        return (
            <div>
                <div>{this.state.login_state_text}</div>
                <form onSubmit={handleSubmit}>
                    <div>ユーザー名<input type="text" name="username" value={this.state.name}
                        onChange={(e) => this.setState({ name: e.target.value })} /></div>
                    <div>パスワード<input type="password" name="password" value={this.state.password}
                        onChange={(e) => this.setState({ password: e.target.value })} /></div>
                    <div><input type="submit" name="register" /></div>
                </form>
            </div>
        );
    }
}

const root = document.getElementById('register');
ReactDOM.createRoot(root).render(<Register />);
