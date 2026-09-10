/**
 * עזרים לעיבוד שמע והמרת נתוני PCM מ-Gemini לקובץ MP3 איכותי
 */
import { Mp3Encoder } from '@breezystack/lamejs';

/**
 * ממיר Base64 של נתוני PCM 16-bit 24kHz ל-Blob של קובץ MP3 אמיתי ותקני
 */
export function pcmBase64ToMp3Blob(base64Data, sampleRate = 24000, kbps = 128) {
  // 1. פענוח base64 לבתים
  const binaryString = atob(base64Data);
  const pcmLength = binaryString.length;
  const numSamples = Math.floor(pcmLength / 2);
  const samples = new Int16Array(numSamples);

  // קריאת דגימות 16-bit little-endian
  for (let i = 0; i < numSamples; i++) {
    const byte1 = binaryString.charCodeAt(i * 2);
    const byte2 = binaryString.charCodeAt(i * 2 + 1);
    let sample = byte1 | (byte2 << 8);
    if (sample >= 0x8000) sample -= 0x10000;
    samples[i] = sample;
  }

  // 2. קידוד MP3 באמצעות lamejs
  const channels = 1; // מונו
  const encoder = new Mp3Encoder(channels, sampleRate, kbps);
  const mp3Chunks = [];
  const chunkSize = 1152;

  for (let i = 0; i < numSamples; i += chunkSize) {
    const chunk = samples.subarray(i, i + chunkSize);
    const mp3buf = encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) {
      mp3Chunks.push(mp3buf);
    }
  }

  const endbuf = encoder.flush();
  if (endbuf.length > 0) {
    mp3Chunks.push(endbuf);
  }

  return new Blob(mp3Chunks, { type: 'audio/mp3' });
}

/**
 * המרת PCM ל-WAV (נשמר כגיבוי)
 */
export function pcmBase64ToWavBlob(base64Data, sampleRate = 24000) {
  const binaryString = atob(base64Data);
  const pcmLength = binaryString.length;
  const pcmBytes = new Uint8Array(pcmLength);
  for (let i = 0; i < pcmLength; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const totalWavSize = 44 + pcmLength;
  const buffer = new ArrayBuffer(totalWavSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, pcmLength, true);

  const wavBytes = new Uint8Array(buffer);
  wavBytes.set(pcmBytes, 44);

  return new Blob([wavBytes], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * הורדת קובץ למכשיר
 */
export function downloadBlob(blob, filename = 'radio-ad.mp3') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * שיתוף קובץ שמע ישיר (Web Share API)
 * במובייל מעביר את קובץ ה-MP3 ישירות ל-WhatsApp או Telegram כהודעת שמע
 */
export async function shareAudioFile(blob, filename = 'radio-ad.mp3', title = 'פרסומת קולית', text = '') {
  const file = new File([blob], filename, { type: 'audio/mp3' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing file:', err);
      }
      return { success: false, error: err };
    }
  }

  return { success: false, method: 'unsupported' };
}

/**
 * פתיחת WhatsApp Web
 */
export function openWhatsAppWeb() {
  window.open('https://web.whatsapp.com', '_blank');
}

/**
 * פתיחת Telegram Web
 */
export function openTelegramWeb() {
  window.open('https://web.telegram.org', '_blank');
}
