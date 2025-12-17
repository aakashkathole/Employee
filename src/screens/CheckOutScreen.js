import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Camera } from "react-native-camera-kit";
import ImageResizer from "react-native-image-resizer";

export default function CheckOutScreen() {
  const cameraRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const capturePhoto = async () => {
    const image = await cameraRef.current.capture();

    // Optional resize (recommended for face API)
    const resized = await ImageResizer.createResizedImage(
      image.uri,
      1080,
      1350,
      "JPEG",
      92
    );

    setCapturedImage(resized.uri);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const submitCheckIn = () => {
    // Here you will POST image to backend
    console.log("Submit image:", capturedImage);
  };

  return (
    <View style={styles.container}>
      {/* CAMERA PREVIEW */}
      {!capturedImage && (
        <View style={styles.cameraWrapper}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          cameraType="front"
          flashMode="auto"
        />
        </View>
      )}

      {/* IMAGE PREVIEW */}
      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.preview} />
      )}

      {/* ACTION BUTTONS */}
      <View style={[styles.spacer, { flex: 2 }]} />
      <View style={styles.actions}>
        {!capturedImage ? (
          <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
            <Text style={styles.btnText}>Capture</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.retakeBtn} onPress={retakePhoto}>
              <Text style={styles.btnText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={submitCheckIn}
            >
              <Text style={styles.btnText}>Submit Check Out</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingBottom: 15,
  },
  cameraWrapper: {
    height: "85%",
    borderRadius: 25,
    overflow: "hidden",
  },
  camera: {
    flex: 1
  },
  preview: {
    borderRadius: 25,
    height: "85%",
    marginBottom: 15,
  },
  actions: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  captureBtn: {
    backgroundColor: "#fff",
    width: '75%',
    padding: 15,
    borderRadius: 25,
  },
  retakeBtn: {
    backgroundColor: "#fff",
    width: '30%',
    padding: 15,
    borderRadius: 25,
  },
  submitBtn: {
    backgroundColor: "#fff",
    width: '60%',
    padding: 15,
    borderRadius: 25,
  },
  btnText: {
    color: "#000",
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    textAlign: "center"
  },
});
