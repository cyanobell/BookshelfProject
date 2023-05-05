'use strict';
import { ShowBooks } from './bookUtil.js';

function BookDeleteState({ books, deleteBook }) {
  const bookButton = (index) => {
    return (<button onClick={() => deleteBook(index)}>本を削除</button>);
  }
  return (
    <div>
      <ShowBooks
        books={books}
        bookButton={bookButton}
      />
    </div>
  );
}

export default BookDeleteState;
