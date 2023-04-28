'use strict';
export function checkIsValidISBN(isbn) {
    if (isbn === null) {
        return false;
    }
    const isbn_str = isbn.toString();
    //現状古い規格は非対応
    if (isbn_str.length != 13) {
        return false;
    }
    //現状古い規格は非対応
    if (isbn_str[0] != '9' && isbn_str[1] != '7') {
        return false;
    }
    const check_digit = parseInt(isbn_str.slice(-1)); // バーコードからチェックディジットを抽出する
    const barcode_digits = isbn_str.slice(0, -1).split(""); // チェックディジットを除いたバーコードの桁を抽出する

    //チェックデジットと照らし合わせる数字を生成
    let sum = 0;
    for (let i = 0; i < barcode_digits.length; i++) {
        if (i % 2 === 0) {
            sum += parseInt(barcode_digits[i]); // 奇数桁を足す
        } else {
            sum += 3 * parseInt(barcode_digits[i]); // 偶数桁を3倍する
        }
    }

    //チェックデジットと照らし合わせる
    if ((sum + check_digit) % 10 === 0) {
        return true;
    } else {
        return false;
    }
}

export async function getBookJson(isbn) {
    const url = "https://api.openbd.jp/v1/get?isbn=" + isbn;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data[0]) {
            return data[0];
        } else {
            return { summary: { title: "本の情報を取得できませんでした。isbn:" + isbn } };
        }
    } catch (error) {
        console.error("Error occurred while fetching book data:", error);
        return { summary: { title: "本のデータを取得中にエラーが発生しました isbn:" + isbn } };
    }
}

export function ShowBooks({ books, bookButton }) {
    if (books.length === 0) {
        return <div>本が登録されていません。</div>;
    }
    const readStateText = (read_state) => {
        switch (read_state) {
            case 0:
                return "未読";
            case 1:
                return "読み止し";
            case 2:
                return "読了";
        }
    }
    const listItems = books.map((book, index) => {
        if (book.detail !== undefined) {
            return (
                <tbody key={book.id}>
                    <tr className="bookDetail">
                        <td>{book.detail.summary.title}</td>
                        <td><img src={book.detail.summary.cover}
                            alt="book_image" width="100" height=" auto" /></td>
                        <td>:</td>
                        <td>{readStateText(book.read_state)}</td>
                        <td>{bookButton(index)}</td>
                    </tr>
                </tbody>
            );
        } else {
            return (
                <tbody key={book.id}>
                    <tr className="bookDetails"><td></td></tr>
                </tbody>
            );
        }

    });
    return (
        <table>
            {listItems}
        </table>
    );
}
