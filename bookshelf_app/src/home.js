'use strict';
import BookShowState from './BookShowState.js';
import BookAddState from './BookAddState.js';
import BookReadingChangeState from './BookReadingChangeState.js';
import BookDeleteState from './BookDeleteState.js';
import CallAPIRapper from './CallAPIRapper.js';

function ModeSelecter(props) {
  return (
    <div className="form-group">
      <input type="radio" name="ModeSelecter" onClick={props.onClickShow} defaultChecked />閲覧モード
      <input type="radio" name="ModeSelecter" onClick={props.onClickAdd} />書籍追加モード
      <input type="radio" name="ModeSelecter" onClick={props.onClickChange} />読書ステート変更モード
      <input type="radio" name="ModeSelecter" onClick={props.onClickDelete} />書籍削除モード
    </div>
  );
}

class Bookshelf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      server_response: ' ',
      inputingIsbn: '',
      books: undefined,
      mode_state: 0
    };
    this.loadBooks();
  }

  loadBooks = async () => {
    try {
      const json = await CallAPIRapper.loadBooks();
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          this.setState({ books: json.books });
          return;
        case 'user is not logined':
          this.setState({ server_response: 'セッション切れです。再ログインしてください。' });
          return;
        default:
          this.setState({ server_response: 'サーバーエラーが発生しました。' });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({ server_response: 'サーバーエラーが発生しました。' });
    }
  }

  registerNewBook = async (inputingIsbn) => {
    if (inputingIsbn.length === 0) {
      console.log('res: empty');
      this.setState({ server_response: '入力欄が空です。' });
      return;
    }
    try {
      const json = await CallAPIRapper.registerNewIsbn(inputingIsbn);
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          this.setState({ server_response: '登録できました！' });
          this.setState({ inputingIsbn: '' });
          this.setState({ books: this.state.books.concat([json.book]) });
          return;
        case 'user is not logined':
          this.setState({ server_response: 'セッション切れです。再ログインしてください。' });
          return;
        case 'isbn is too old or wrong':
          this.setState({ server_response: 'ISBNコードが間違っているか、対応していない形式です。' });
          return;
        case 'book is already exist':
          this.setState({ server_response: 'その本はすでに登録されています。' });
          return;
        default:
          this.setState({ server_response: 'サーバーエラーが発生しました。' });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({ server_response: 'サーバーエラーが発生しました。' });
    }
  }

  changeBookReadState = async (index, new_read_state) => {
    try {
      const json = await CallAPIRapper.changeBookReadState(this.state.books[index], new_read_state);
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          this.setState({ server_response: '変更できました！' });
          this.setState({ inputingIsbn: '' });
          const { books } = this.state;
          const newBooks = [...books];
          newBooks[index] = { ...books[index], read_state: new_read_state };
          this.setState({ books: newBooks });
          return;
        case 'user is not logined':
          this.setState({ server_response: 'セッション切れです。再ログインしてください。' });
          return;
        default:
          this.setState({ server_response: 'サーバーエラーが発生しました。' });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({ server_response: 'サーバーエラーが発生しました。' });
    }
  }

  deleteBook = async (index) => {
    try {
      const json = await CallAPIRapper.deleteBook(this.state.books[index]);
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          this.setState({ server_response: this.state.books[index].detail.summary.title + ' を削除しました。' });
          this.setState({
            books: this.state.books.filter((book, findex) => findex !== index),
          });
          return;
        case 'user is not logined':
          this.setState({ server_response: 'セッション切れです。再ログインしてください。' });
          return;
        default:
          this.setState({ server_response: 'サーバーエラーが発生しました。' });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({ server_response: 'サーバーエラーが発生しました。' });
    }
  }

  shareUrlCopyToCrip = async () => {
    try {
      const json = await CallAPIRapper.getLoginingUserShareingId();
      console.log('res: ' + json.text);
      switch (json.text) {
        case 'success':
          const shareUrl = `${window.location.origin}/shared_books/${json.user_id}`;
          navigator.clipboard.writeText(shareUrl).then(
            () => {
              console.log(shareUrl + " was copyed");
              this.setState({ server_response: 'クリップボードに共有用URLをコピーしました。' });
            },
            () => {
              console.log(shareUrl + " :can not copy to clipboard");
              this.setState({ server_response: 'クリップボードにアクセスできませんでした URL: ' + shareUrl });
            });
          return;
        case 'user is not logined':
          this.setState({ server_response: 'セッション切れです。再ログインしてください。' });
          return;
        default:
          this.setState({ server_response: 'サーバーエラーが発生しました。' });
          return;
      }
    } catch (error) {
      console.error(error);
      this.setState({ server_response: 'サーバーエラーが発生しました。' });
    }
  }

  render() {
    const modeStateHtml = (mode_state) => {
      switch (mode_state) {
        case 0:
          return (
            <BookShowState
              detailOnClick={index => {
                const scrollToOptions = {
                  top: 0, 
                  behavior: 'smooth' 
                };
                window.scrollTo(scrollToOptions);
              }}
              books={this.state.books}
              addHtml={<></>}
            />);
        case 1:
          return (
            <BookAddState
              submitOnClick={this.registerNewBook}
              books={this.state.books}
            />
          );
        case 2:
          return (<BookReadingChangeState
            books={this.state.books}
            changeReadState={index => {
              let read_state = this.state.books[index].read_state;
              let new_read_state = read_state < 2 ? read_state + 1 : 0;
              this.changeBookReadState(index, new_read_state);
            }}
          />);
        case 3:
          return (<BookDeleteState
            books={this.state.books}
            deleteBook={index => { this.deleteBook(index) }}
          />);
      }
    }

    return (
      <div className="Bookshelf">
        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'right', padding: 10 }}>
          <button onClick={() => this.shareUrlCopyToCrip()} >本棚を共有</button>
          <button onClick={() => location.href = '/logout'}>ログアウト</button>
        </div>
        <div style={{ minHeight: '35px' }} className="ServerResponse">{this.state.server_response}</div>
        <hr></hr>
        <ModeSelecter
          mode_state={this.state.mode_state}
          onClickShow={() => this.setState({ mode_state: 0, server_response: '' })}
          onClickAdd={() => this.setState({ mode_state: 1, server_response: '' })}
          onClickChange={() => this.setState({ mode_state: 2, server_response: '' })}
          onClickDelete={() => this.setState({ mode_state: 3, server_response: '' })}
        />
        <hr></hr>
        <div>
          {modeStateHtml(this.state.mode_state)}
        </div>
      </div >
    );
  }
}

const root = document.getElementById('book_shelf');
ReactDOM.createRoot(root).render(<Bookshelf />);
