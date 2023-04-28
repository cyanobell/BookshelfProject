'use strict';

import { checkIsValidISBN, ShowBooks } from './bookUtil.js';
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
  async componentDidMount() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      this.setState({
        devices: videoDevices
      });
      if (videoDevices.length > 0) {
        await this.startCamera(videoDevices[this.state.currentDeviceIndex].deviceId);
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
        stream
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
  captureImage = () => {
    if (!this.videoRef.current || this.videoRef.current.videoWidth === 0 || this.videoRef.current.videoHeight === 0) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = this.videoRef.current.videoWidth;
    canvas.height = this.videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.props.onReading(imageData);
    window.requestAnimationFrame(this.captureImage);
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
      readedIsbnValue: null
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
      let barcodes = await this.detectBarcodes(imageData);
      if (barcodes && barcodes.length > 0) {
        for (const barcode of barcodes) {
          if (checkIsValidISBN(barcode.rawValue)) {
            this.setState({
              readedIsbnValue: barcode.rawValue
            });
          }
        }
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
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
      onClick: submitOnClick
    }, "\u8FFD\u52A0"));
  }
}
class BookAddState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputingIsbn: ""
    };
  }
  render() {
    const {
      submitOnClick,
      books
    } = this.props;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(IsbnInputArea, {
      inputingIsbn: this.state.inputingIsbn,
      submitOnClick: () => {
        submitOnClick(this.state.inputingIsbn);
        this.setState({
          inputingIsbn: ""
        });
      },
      onBarcodeReadSuccess: barcode => {
        this.setState({
          inputingIsbn: barcode
        });
      },
      inputOnChange: e => {
        this.setState({
          inputingIsbn: e.target.value.replace(/[^0-9]/g, "")
        });
      }
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(ShowBooks, {
      books: books,
      bookButton: id => ""
    }));
  }
}
export default BookAddState;