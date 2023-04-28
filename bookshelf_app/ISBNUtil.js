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
    console.log("Barcode error: " + sum + check_digit);
    return false;
  }
}
export async function getBookJson(isbn) {
  const url = "https://api.openbd.jp/v1/get?isbn=" + isbn;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data[0]) {
      console.log("call isbn api success");
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