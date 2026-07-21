import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const ExpenseQRScanner = ({ onScan }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "expense-qr-reader",
            {
                fps: 10,
                qrbox: {
                    width: 350,
                    height: 350
                },
            },
            false
        );

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
            },
            () => { }
        );

        return () => {
            scanner.clear().catch(() => { });
        };
    }, [onScan]);

    return <div id="expense-qr-reader" />;
};

export default ExpenseQRScanner;