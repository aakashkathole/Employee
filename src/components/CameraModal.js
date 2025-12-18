import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';
import ImageResizer from 'react-native-image-resizer';
import { logAttendanceAction } from '../Services/attendanceServices';

const CameraModal = ({ visible, actionType, onSuccess, onClose }) => {
  const cameraRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (visible && !capturedImage) {
      setCountdown(5);
      setIsCapturing(true);
      const id = setTimeout(() => {
        capturePhoto();
      }, 5000);
      setTimeoutId(id);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        clearTimeout(id);
        clearInterval(interval);
      };
    }
  }, [visible, capturedImage,]);


  const capturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const image = await cameraRef.current.capture();
      let resized = await ImageResizer.createResizedImage(
        image.uri,
        1080,
        1350,
        'JPEG',
        90 // quality <1MB
      );
      setCapturedImage(resized.uri);
      setIsCapturing(false);
      submitImage(resized.uri);
    } catch (err) {
      console.error('Capture error:', err);
      setIsCapturing(false);
      setError('Failed to capture image');
    }
  };

  const submitImage = async (imageUri) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await logAttendanceAction(actionType, imageUri);
      console.log('Raw API Response:', response);
      let parsedResponse = response;
      if (typeof response === 'string') {
        try {
          parsedResponse = JSON.parse(response);
        } catch {
          parsedResponse = { message: response };
        }
      }
      console.log('Parsed API Response:', parsedResponse);
      if (parsedResponse.success || parsedResponse.status === 'success') {
        Alert.alert('Success', `${actionType} completed successfully`);
        onSuccess();
      } else {
        throw new Error(parsedResponse.message || parsedResponse.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      let errorMessage = 'Submission failed';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      Alert.alert('Error', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
    setCountdown(5);
    setTimeoutId(null);
  };

  const closeModal = () => {
    setCapturedImage(null);
    setError(null);
    setIsCapturing(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={closeModal}>
      <View style={styles.container}>
        {!capturedImage && (
          <View style={styles.cameraWrapper}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              cameraType="front"
              flashMode="auto"
            />
            {/* Face Grid Overlay */}
            <View style={styles.maskContainer}>
                <View style={styles.maskOverlay} />
                <View style={styles.ovalContainer}>
                    <View style={styles.ovalBorder} />
                </View>
            </View>
            
            {isCapturing && (
              <View style={styles.overlay}>
                <Text style={styles.countdownText}>Capturing in {countdown} seconds...</Text>
              </View>
            )}
          </View>
        )}

        {capturedImage && (
          <Image source={{ uri: capturedImage }} style={[styles.preview, { transform: [{ scaleX: -1 }] }]} />
        )}

        <View style={styles.actions}>
          {isSubmitting ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : error ? (
            <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
              <Text style={styles.btnText}>Retake</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingBottom: 15,
  },
  cameraWrapper: {
    height: '85%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  countdownText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
  },
  manualCaptureBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  manualCaptureText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  preview: {
    borderRadius: 25,
    height: '85%',
    marginBottom: 15,
  },
  actions: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeBtn: {
    backgroundColor: '#fff',
    width: '75%',
    padding: 15,
    borderRadius: 25,
  },
  closeBtn: {
    backgroundColor: '#fff',
    width: '75%',
    padding: 15,
    borderRadius: 25,
  },
  btnText: {
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },

  maskContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},

maskOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.55)',
},

ovalContainer: {
  position: 'absolute',
  top: '20%',
  left: '10%',
  width: '80%',
  height: '60%',
  justifyContent: 'center',
  alignItems: 'center',
},

ovalBorder: {
  width: '100%',
  height: '100%',
  borderRadius: 999,
  borderWidth: 3,
  borderColor: 'rgba(255,255,255,0.8)',
  backgroundColor: 'transparent',
},

});

export default CameraModal;