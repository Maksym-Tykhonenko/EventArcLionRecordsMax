// assets.js
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

// Читання унікального файлу підпису (для унікалізації бінару)
const signaturePath = RNFS.MainBundlePath + '/EventArcLionRecordsAssets/EventArcLionRecords_signature.dat';
RNFS.readFile(signaturePath).then(data => {
  // Можна вивести у консоль, якщо треба
  // console.log('App signature:', data);
}).catch(() => {
  // Ігноруємо помилки читання
});
