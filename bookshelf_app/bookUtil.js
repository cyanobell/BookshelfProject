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
  if (isbn_str[0] != '9' || isbn_str[1] != '7') {
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
      return {
        summary: {
          title: "本の情報を取得できませんでした。isbn:" + isbn
        }
      };
    }
  } catch (error) {
    console.error("Error occurred while fetching book data:", error);
    return {
      summary: {
        title: "本のデータを取得中にエラーが発生しました isbn:" + isbn
      }
    };
  }
}
export function ShowBooks({
  books,
  bookButton
}) {
  if (books === undefined) {
    return /*#__PURE__*/React.createElement("div", null);
  }
  if (books.length === 0) {
    return /*#__PURE__*/React.createElement("div", null, "\u672C\u304C\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002");
  }
  const readStateText = read_state => {
    switch (read_state) {
      case 0:
        return "未読";
      case 1:
        return "読み止し";
      case 2:
        return "読了";
    }
  };
  const listItems = books.map((book, index) => {
    if (book.detail !== undefined) {
      return /*#__PURE__*/React.createElement("tbody", {
        key: book.id
      }, /*#__PURE__*/React.createElement("tr", {
        className: "bookDetail"
      }, /*#__PURE__*/React.createElement("td", null, book.detail.summary.title), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("img", {
        src: book.detail.summary.cover,
        alt: "book_image",
        width: "100",
        height: " auto"
      })), /*#__PURE__*/React.createElement("td", null, ":"), /*#__PURE__*/React.createElement("td", null, readStateText(book.read_state)), /*#__PURE__*/React.createElement("td", null, bookButton(index))));
    } else {
      return /*#__PURE__*/React.createElement("tbody", {
        key: book.id
      }, /*#__PURE__*/React.createElement("tr", {
        className: "bookDetails"
      }, /*#__PURE__*/React.createElement("td", null)));
    }
  });
  return /*#__PURE__*/React.createElement("table", null, listItems);
}