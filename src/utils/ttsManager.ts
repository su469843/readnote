import {NativeModules, Platform} from 'react-native';
import {getCachesDir, rnfsWriteFile} from './fileManager';
import {loadSettings} from './settings';

// TTS 临时文件最大存活时间
const TTS_CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 小时

const {XYGTTS} = NativeModules;

/**
 * TTS Manager - 支持三种 TTS 来源：
 * 1. Edge TTS Cloudflare Worker（OpenAI 兼容 API）
 * 2. Android 原生 TTS（系统内置 TextToSpeech）
 * 3. Web Speech API（兜底回退）
 *
 * Edge TTS API 格式（OpenAI 兼容）：
 *   POST https://<worker>/v1/audio/speech
 *   Authorization: Bearer <api-key>
 *   Body: { model, input, voice, speed, response_format }
 *   返回: MP3 二进制音频
 */

export async function speakText(text: string): Promise<void> {
  const settings = await loadSettings();

  // 如果配置了 Edge TTS 端点，使用 OpenAI 兼容 API
  if (settings.ttsEndpoint) {
    await speakViaEdgeTTS(settings, text);
    return;
  }

  // 回退到 Android 原生 TTS
  if (Platform.OS === 'android' && XYGTTS) {
    await XYGTTS.speak(text);
    return;
  }

  // 最终回退
  await speakViaWebSpeech(text);
}

async function speakViaEdgeTTS(
  settings: {ttsEndpoint: string; ttsApiKey: string; ttsVoice: string},
  text: string,
): Promise<void> {
  const baseUrl = settings.ttsEndpoint.replace(/\/+$/, '');
  const url = `${baseUrl}/v1/audio/speech`;

  const body = JSON.stringify({
    model: 'tts-1',
    input: text,
    voice: settings.ttsVoice || 'zh-CN-XiaoxiaoNeural',
    response_format: 'mp3',
    speed: 1.0,
  });

  // 使用 XMLHttpRequest + arraybuffer 获取二进制音频数据
  // 避免 response.blob()、FileReader 等 Web API（Hermes 引擎不支持）
  const base64 = await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.setRequestHeader('Content-Type', 'application/json');
    if (settings.ttsApiKey) {
      xhr.setRequestHeader('Authorization', `Bearer ${settings.ttsApiKey}`);
    }

    xhr.responseType = 'arraybuffer';

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const arrayBuffer: ArrayBuffer | null = xhr.response;
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          reject(new Error('Empty response from TTS server'));
          return;
        }
        // ArrayBuffer → Uint8Array → binary string → base64
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        try {
          resolve(btoa(binary));
        } catch (e) {
          reject(new Error('Base64 encoding failed'));
        }
      } else {
        // 尝试读取错误响应文本
        try {
          const text = xhr.responseText || '';
          reject(new Error(`Edge TTS error ${xhr.status}: ${text}`));
        } catch {
          reject(new Error(`Edge TTS error ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.ontimeout = () => reject(new Error('Network request timed out'));

    xhr.send(body);
  });

  // 将 MP3 保存为临时文件，通过原生 MediaPlayer 播放
  const tempPath = `${getCachesDir()}/tts_${Date.now()}.mp3`;
  await rnfsWriteFile(tempPath, base64, 'base64');

  // 通过原生模块播放 MP3 文件
  if (Platform.OS === 'android' && XYGTTS) {
    await XYGTTS.playAudioFile(tempPath);
  }
}

async function speakViaWebSpeech(text: string): Promise<void> {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
    return;
  }
  throw new Error('No TTS engine available');
}

export function stopSpeaking(): void {
  if (Platform.OS === 'android' && XYGTTS) {
    XYGTTS.stop();
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function extractPlainText(htmlContent: string): string {
  return htmlContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
