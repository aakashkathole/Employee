import { PermissionsAndroid, Platform, Linking } from 'react-native';

export const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    // For Android 13+ (API 33+), we need READ_MEDIA permission for downloads
    if (Platform.Version >= 33) {
      const mediaPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Media Access Required',
          message: 'This app needs media access to save salary slip PDFs',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Grant Access',
        },
      );
      return mediaPermission === PermissionsAndroid.RESULTS.GRANTED;
    }

    // For Android 6-12, use WRITE_EXTERNAL_STORAGE
    const storagePermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'This app needs storage access to save salary slip PDFs to your Downloads folder',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Grant Permission',
      },
    );
    return storagePermission === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Storage permission error:', err);
    return false;
  }
};

export const requestNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification Permission',
        message: 'Allow notifications to show download completion status',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Allow',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return false;
  }
};

export const openAppSettings = () => {
  Linking.openSettings();
};

export const requestAllPermissions = async () => {
  try {
    const storageGranted = await requestStoragePermission();
    const notificationGranted = await requestNotificationPermission();

    console.log('Permissions - Storage:', storageGranted, 'Notification:', notificationGranted);

    return storageGranted;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};