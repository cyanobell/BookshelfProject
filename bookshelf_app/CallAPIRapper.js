'use strict';

import { getBookJson } from './bookUtil.js';
const CallAPIRapper = {
  async loadBooks() {
    try {
      const response = await fetch(`/api/get_have_books`, {
        method: 'GET'
      });
      const books = await response.json();
      console.log(books);
      for (const book of books) {
        book.detail = await getBookJson(book.isbn);
      }
      return books;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  async loadBooksWithSharedId(shared_id) {
    try {
      const response = await fetch(`/api/get_shared_books/${shared_id}`, {
        method: 'GET'
      });
      const books = await response.json();
      for (const book of books) {
        book.detail = await getBookJson(book.isbn);
      }
      return books;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  async loadUsernameWithSharedId(shared_id) {
    try {
      const response = await fetch(`/api/get_user_name_to_id/${shared_id}`, {
        method: 'GET'
      });
      const json = await response.json();
      return json.user_name;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  async registerNewIsbn(inputingIsbn) {
    try {
      if (inputingIsbn.length === 0) {
        this.setState({
          server_response: '入力欄が空です。'
        });
        return;
      }
      let send_data = {
        isbn: inputingIsbn
      };
      const response = await fetch('/api/register_book', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      let json = await response.json();
      if (json.book !== undefined) {
        json.book.detail = await getBookJson(json.book.isbn);
      }
      return json;
    } catch (error) {
      console.error(error);
      return {
        server_response: 'サーバーエラーが発生しました。'
      };
    }
  },
  async changeBookReadState(book, new_read_state) {
    try {
      //サーバーサイドへはbook.detailを送らないようにします。
      let send_book = JSON.parse(JSON.stringify(book));
      send_book.detail = undefined;
      let send_data = {
        book: send_book,
        new_read_state: new_read_state
      };
      const response = await fetch('/api/change_read_state', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return {
        server_response: 'サーバーエラーが発生しました。'
      };
    }
  },
  async deleteBook(book) {
    try {
      //サーバーサイドへはbook.detailを送らないようにします。
      let send_book = JSON.parse(JSON.stringify(book));
      send_book.detail = undefined;
      let send_data = {
        book: send_book
      };
      const response = await fetch('/api/delete_book', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_data)
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return {
        server_response: 'サーバーエラーが発生しました。'
      };
    }
  },
  async getLoginingUserId() {
    try {
      const response = await fetch(`/api/get_user_id`, {
        method: 'GET'
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return {
        server_response: 'サーバーエラーが発生しました。'
      };
    }
  }
};
export default CallAPIRapper;