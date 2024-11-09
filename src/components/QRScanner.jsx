// components/QRScanner.jsx

import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Initialize scanner with better configuration
    const qrScanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1,
      showTorchButtonIfSupported: true,
      rememberLastUsedCamera: true,
      defaultZoomValueIfSupported: 2
    });

    setScanner(qrScanner);

    return () => {
      if (qrScanner) {
        qrScanner.clear();
      }
    };
  }, []);

  const handleScanSuccess = async (decodedText) => {
    try {
      setScanning(true);
      setError(null);

      // Validate QR data format
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
        if (!qrData.attendanceId || !qrData.token) {
          throw new Error('Invalid QR code format');
        }
      } catch (e) {
        throw new Error('Invalid QR code');
      }

      await onScanSuccess(decodedText);
      
      if (scanner) {
        scanner.clear();
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Scan Attendance QR Code</h3>
          <p className="text-sm text-gray-500 mb-4">
            Please align the QR code within the frame
          </p>
        </div>

        <div id="qr-reader" className="w-full" />

        {error && (
          <div className="flex items-center p-3 rounded bg-red-50 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button 
            onClick={onClose}
            variant="outline"
            disabled={scanning}
          >
            Cancel
          </Button>

          {scanning && (
            <Button disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QRScanner;