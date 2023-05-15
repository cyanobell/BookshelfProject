'use strict';

import { checkIsValidISBN, getBookJson, ShowBooks } from './bookUtil.js';
class PlayCamera extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDeviceIndex: 0,
      devices: [],
      stream: null
    };
    this.videoRef = React.createRef();
    this.handleCameraChange = this.handleCameraChange.bind(this);
  }
  async getHighestResolutionCameraIndex(videoDevices) {
    let highestResolutionCameraIndex = 0;
    let highestResolution = 0;
    for (let i = 0; i < videoDevices.length; i++) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: videoDevices[i].deviceId
        }
      });
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      const resolution = settings.width * settings.height;
      if (resolution > highestResolution) {
        highestResolutionCameraIndex = i;
        highestResolution = resolution;
      }
      track.stop();
    }
    return highestResolutionCameraIndex;
  }
  async componentDidMount() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      this.setState({
        devices: videoDevices
      });
      const highestResolutionCameraIndex = await this.getHighestResolutionCameraIndex(videoDevices);
      this.setState({
        devices: videoDevices
      });
      if (videoDevices.length > 0) {
        await this.startCamera(videoDevices[highestResolutionCameraIndex].deviceId);
      }
      this.captureImage();
    } catch (error) {
      console.error(error);
    }
  }
  async componentWillUnmount() {
    await this.stopCamera();
  }
  async startCamera(deviceId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId
        }
      });
      this.videoRef.current.srcObject = stream;
      await this.videoRef.current.play();
      this.setState({
        stream: stream
      });
    } catch (error) {
      console.error(error);
    }
  }
  async stopCamera() {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
      this.setState({
        stream: null
      });
    }
  }
  async handleCameraChange() {
    const {
      currentDeviceIndex,
      devices
    } = this.state;
    const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
    await this.stopCamera();
    await this.startCamera(devices[nextDeviceIndex].deviceId);
    this.captureImage();
    this.setState({
      currentDeviceIndex: nextDeviceIndex
    });
  }
  captureImage = async () => {
    if (!this.videoRef.current || this.videoRef.current.videoWidth === 0 || this.videoRef.current.videoHeight === 0) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = this.videoRef.current.videoWidth;
    canvas.height = this.videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    await this.props.onReading(imageData);
    try {
      window.requestAnimationFrame(await this.captureImage());
    } catch {
      //カメラが止まった。　
    }
  };
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "barcode-reader"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid black",
        width: `${this.props.width}px`,
        height: `${this.props.height}px`,
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement("video", {
      ref: this.videoRef,
      style: {
        objectFit: "contain",
        width: "100%",
        height: "100%"
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: this.handleCameraChange
    }, "\u30AB\u30E1\u30E9\u5909\u66F4"));
  }
}
class BarcodeReader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSrc: null,
      readedIsbnValue: null,
      beforeReadedIsbnValue: null
    };
    this.video = {
      width: 640,
      height: 480
    };
    this.videoHTML = /*#__PURE__*/React.createElement(React.Fragment, null);
    this.detectIsbnCode = this.detectIsbnCode.bind(this);
    if (typeof BarcodeDetector === "function") {
      this.videoHTML = /*#__PURE__*/React.createElement(PlayCamera, {
        onReading: this.detectIsbnCode,
        width: this.video.width,
        height: this.video.height
      });
    } else {
      this.videoHTML = /*#__PURE__*/React.createElement("div", null, "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u306F\u3001\u30D0\u30FC\u30B3\u30FC\u30C9\u306E\u8AAD\u307F\u53D6\u308A\u306B\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093");
    }
  }
  async detectBarcodes(imageData) {
    try {
      let barcodes = [];
      if (typeof BarcodeDetector === "function") {
        const barcodeDetector = new BarcodeDetector();
        barcodes = await barcodeDetector.detect(imageData);
      }
      if (barcodes.length > 0) {
        return barcodes;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async detectIsbnCode(imageData) {
    try {
      let readedIsbn = undefined;
      let barcodes = await this.detectBarcodes(imageData);
      if (barcodes && barcodes.length > 0) {
        for (const barcode of barcodes) {
          if (checkIsValidISBN(barcode.rawValue)) {
            readedIsbn = barcode.rawValue;
          }
        }
      }
      if (readedIsbn === undefined) {
        return;
      }

      //精度上昇のため、2回連続して同じ数が読まれた時を結果とする。
      if (this.state.beforeReadedIsbnValue === readedIsbn) {
        this.setState({
          readedIsbnValue: readedIsbn
        });
      } else {
        this.setState({
          beforeReadedIsbnValue: readedIsbn
        });
        //0.1秒待つ
        const sleep_time = 100;
        await new Promise(resolve => setTimeout(resolve, sleep_time));
      }
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }
  render() {
    const {
      onReadSuccess
    } = this.props;
    if (this.state.readedIsbnValue) {
      onReadSuccess(this.state.readedIsbnValue);
    }
    return /*#__PURE__*/React.createElement("div", null, this.videoHTML);
  }
}
class IsbnInputArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showBarcodeReader: false
    };
  }
  render() {
    const {
      showBarcodeReader
    } = this.state;
    const {
      inputingIsbn,
      inputOnChange,
      onBarcodeReadSuccess,
      submitOnClick
    } = this.props;
    return /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("div", null, "ISBN\u30B3\u30FC\u30C9", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "isbn",
      value: inputingIsbn,
      inputMode: "numeric",
      onChange: inputOnChange
    })), showBarcodeReader && /*#__PURE__*/React.createElement(BarcodeReader, {
      onReadSuccess: code => {
        onBarcodeReadSuccess(code);
        this.setState({
          showBarcodeReader: false
        });
      }
    }), !showBarcodeReader && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => this.setState({
        showBarcodeReader: true
      })
    }, "\u30D0\u30FC\u30B3\u30FC\u30C9\u8AAD\u307F\u53D6\u308A"), showBarcodeReader && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => this.setState({
        showBarcodeReader: false
      })
    }, "\u8AAD\u307F\u53D6\u308A\u4E2D\u6B62"), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      onClick: submitOnClick,
      disabled: !checkIsValidISBN(inputingIsbn)
    }, "\u8FFD\u52A0"), /*#__PURE__*/React.createElement("div", null, inputingIsbn.length === 13 && !checkIsValidISBN(inputingIsbn) && "ISBNコードに誤りがあります。", " "));
  }
}
class BookAddState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputingIsbn: '',
      bookDetail: null
    };
  }
  render() {
    const {
      submitOnClick,
      books
    } = this.props;
    const isbnDetail = async input => {
      if (checkIsValidISBN(input)) {
        const book_detail = await getBookJson(input);
        this.setState({
          bookDetail: book_detail
        });
      } else {
        this.setState({
          bookDetail: null
        });
      }
    };
    const doSubmitOnClick = () => {
      submitOnClick(this.state.inputingIsbn);
      this.setState({
        inputingIsbn: '',
        bookDetail: null
      });
    };
    const onBarcodeReadSuccess = barcode => {
      this.setState({
        inputingIsbn: barcode
      });
      isbnDetail(barcode);
    };
    const inputOnChange = e => {
      let input = e.target.value.replace(/[^0-9]/g, '');
      if (input.length > 13) {
        input = input.slice(0, 13);
      }
      this.setState({
        inputingIsbn: input
      });
      isbnDetail(input);
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(IsbnInputArea, {
      inputingIsbn: this.state.inputingIsbn,
      submitOnClick: doSubmitOnClick,
      onBarcodeReadSuccess: onBarcodeReadSuccess,
      inputOnChange: inputOnChange
    }), this.state.bookDetail && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("h3", null, "\u30D7\u30EC\u30D3\u30E5\u30FC"), /*#__PURE__*/React.createElement("h4", null, this.state.bookDetail.summary.title), /*#__PURE__*/React.createElement("img", {
      src: this.state.bookDetail.summary.cover,
      alt: "book_image",
      width: "auto",
      height: "150"
    })), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: id => ""
    }));
  }
}
export default BookAddState;