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
            this.setState({ devices: videoDevices });

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
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId } });
            this.videoRef.current.srcObject = stream;
            await this.videoRef.current.play();

            this.setState({ stream });
        } catch (error) {
            console.error(error);
        }
    }

    async stopCamera() {
        if (this.state.stream) {
            this.state.stream.getTracks().forEach(track => track.stop());
            this.setState({ stream: null });
        }
    }

    async handleCameraChange() {
        const { currentDeviceIndex, devices } = this.state;
        const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;

        await this.stopCamera();
        await this.startCamera(devices[nextDeviceIndex].deviceId);
        this.captureImage();
        this.setState({ currentDeviceIndex: nextDeviceIndex });
    }

    captureImage = () => {
        if (
            !this.videoRef.current ||
            this.videoRef.current.videoWidth === 0 ||
            this.videoRef.current.videoHeight === 0
        ) {
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
    }

    render() {
        return (
            <div className="barcode-reader">
                <div
                    style={{
                        border: "1px solid black",
                        width: `${this.props.width}px`,
                        height: `${this.props.height}px`,
                        marginBottom: "16px"
                    }}
                >
                    <video
                        ref={this.videoRef}
                        style={{
                            objectFit: "contain",
                            width: "100%",
                            height: "100%"
                        }}
                    />
                </div>
                <button onClick={this.handleCameraChange}>カメラ変更</button>
            </div>
        );
    }
}

class BarcodeReader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgSrc: null,
            readedIsbnValue: null,
        };
        this.video = { width: 640, height: 480 };
        this.videoHTML = <></>;
        this.detectIsbnCode = this.detectIsbnCode.bind(this);
        if (typeof BarcodeDetector === "function") {
            this.videoHTML = <PlayCamera onReading={this.detectIsbnCode} width={this.video.width} height={this.video.height} />;
        }else{
            this.videoHTML = <div>このブラウザは、バーコードの読み取りに対応していません</div>;
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
                        this.setState({ readedIsbnValue: barcode.rawValue });
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
        const { onReadSuccess } = this.props;
        if (this.state.readedIsbnValue) {
            onReadSuccess(this.state.readedIsbnValue);
        }
        return (
            <div>
                { this.videoHTML}
            </div >
        );
    }
}

class IsbnInputArea extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showBarcodeReader: false,
        };
    }

    render() {
        const { showBarcodeReader } = this.state;
        const { inputingIsbn, inputOnChange, onBarcodeReadSuccess, submitOnClick } = this.props;
        return (
            <div className="form-group">
                <div>ISBNコード
                    <input type="text" name="isbn" value={inputingIsbn}
                        inputMode="numeric"
                        onChange={inputOnChange} />
                </div>
                {showBarcodeReader && <BarcodeReader onReadSuccess={(code) => { onBarcodeReadSuccess(code); this.setState({ showBarcodeReader: false }) }} />}
                {!showBarcodeReader && <button type="button" onClick={() => this.setState({ showBarcodeReader: true })}>バーコード読み取り</button>}
                {showBarcodeReader && <button type="button" onClick={() => this.setState({ showBarcodeReader: false })}>読み取り中止</button>}
                <button type="submit" onClick={submitOnClick}>追加</button>
            </div>
        );
    }
}

class BookAddState extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputingIsbn: "",
        };
    }
    render() {
        const { submitOnClick, books } = this.props;

        return (
            <div>
                <hr></hr>
                <IsbnInputArea
                    inputingIsbn={this.state.inputingIsbn}
                    submitOnClick={() => { submitOnClick(this.state.inputingIsbn); this.setState({ inputingIsbn: "" }); }}
                    onBarcodeReadSuccess={(barcode) => { this.setState({ inputingIsbn: barcode }); }}
                    inputOnChange={(e) => { this.setState({ inputingIsbn: e.target.value.replace(/[^0-9]/g, "") }) }}
                />
                <hr></hr>
                <ShowBooks books={books} bookButton={(id) => ""} />
            </div>
        );
    }
}

export default BookAddState;
