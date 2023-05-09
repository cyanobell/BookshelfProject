'use strict';

import { getBookJson, checkIsValidISBN } from './bookUtil.js';
const CallAPIRapper = {
  async loadBooks() {
    try {
      const response = await fetch(`/api/get_have_books`, {
        method: 'GET'
      });
      if (!response.ok) {
        return {
          text: await response.text()
        };
      }
      const books = await response.json();
      for (const book of books) {
        book.detail = await getBookJson(book.isbn);
      }
      return {
        books: books,
        text: 'success'
      };
    } catch (error) {
      '';
      console.error(error);
      return [];
    }
  },
  async loadBooksWithSharedId(shared_id) {
    try {
      const response = await fetch(`/api/get_shared_books/${shared_id}`, {
        method: 'GET'
      });
      if (!response.ok) {
        return {
          text: await response.text()
        };
      }
      const books = await response.json();
      for (const book of books) {
        book.detail = await getBookJson(book.isbn);
      }
      return {
        books: books,
        text: 'success'
      };
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
      if (!response.ok) {
        return {
          text: await response.text()
        };
      }
      const json = await response.json();
      return {
        text: 'success',
        user_name: json.user_name
      };
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  async registerNewIsbn(inputingIsbn) {
    try {
      if (inputingIsbn.length === 0) {
        return {
          text: 'input is empty'
        };
      }
      if (!checkIsValidISBN(inputingIsbn)) {
        return {
          text: 'isbn is too old or wrong'
        };
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
      if (!response.ok) {
        return {
          text: await response.text()
        };
      }
      let json = await response.json();
      json.book.detail = await getBookJson(json.book.isbn);
      return {
        text: 'success',
        book: json.book
      };
    } catch (error) {
      console.error(error);
      return {
        text: 'server error'
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
      if (!response.ok) {
        return {
          text: await response.text()
        };
      }
      return {
        text: 'success'
      };
    } catch (error) {
      console.error(error);
      return {
        text: 'server error'
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
      if (!response.ok) {
        return {
          text: await response.text()
        };
      }
      return {
        text: 'success'
      };
    } catch (error) {
      console.error(error);
      return {
        text: 'server error'
      };
    }
  },
  async getLoginingUserId() {
    try {
      const response = await fetch(`/api/get_user_id`, {
        method: 'GET'
      });
      if (!response.ok) {
        return {
          text: await response.text()
        };
      }
      const json = await response.json();
      return {
        text: 'success',
        user_id: json.user_id
      };
    } catch (error) {
      console.error(error);
      return {
        text: 'server error'
      };
    }
  }
};
export default CallAPIRapper;