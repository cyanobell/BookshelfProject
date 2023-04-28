'use strict';
import { ShowBooks } from './bookUtil.js';

function BookReadingChangeState({ books, changeReadState }) {
    const bookButton = (index) => {
        return (<button onClick={() => changeReadState(index)}>読書状態変更</button>);
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

export default BookReadingChangeState;
