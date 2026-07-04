import {NativeModules, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {loadSettings} from './settings';

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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (settings.ttsApiKey) {
    headers['Authorization'] = `Bearer ${settings.ttsApiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: settings.ttsVoice || 'zh-CN-XiaoxiaoNeural',
      response_format: 'mp3',
      speed: 1.0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge TTS error ${response.status}: ${errorText}`);
  }

  // 将 MP3 保存为临时文件，通过原生 MediaPlayer 播放
  const tempPath = `${RNFS.CachesDirectoryPath}/tts_${Date.now()}.mp3`;

  // 读取响应为 base64
  const blob = await response.blob();
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || result;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  await RNFS.writeFile(tempPath, base64, 'base64');

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
