import {NativeModules, Platform} from 'react-native';
import {loadSettings} from './settings';

const {XYGTTS} = NativeModules;

/**
 * TTS Manager - 支持三种 TTS 来源：
 * 1. 自定义 TTS 端点（用户在设置中配置的 HTTP API）
 * 2. Android 原生 TTS（通过 NativeModules.XYGTTS 桥接）
 * 3. Web Speech API（React Native 不支持，此处作为概念保留，实际使用系统 TTS 回退）
 */

export async function speakText(text: string): Promise<void> {
  const settings = await loadSettings();

  // 如果配置了自定义 TTS 端点，使用 HTTP API 调用
  if (settings.ttsEndpoint) {
    await speakViaEndpoint(settings.ttsEndpoint, text);
    return;
  }

  // 回退到 Android 原生 TTS
  if (Platform.OS === 'android' && XYGTTS) {
    XYGTTS.speak(text);
    return;
  }

  // 最终回退：使用系统内置 TTS 或 Web Speech API
  await speakViaSystem(text);
}

async function speakViaEndpoint(endpoint: string, text: string): Promise<void> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      lang: 'zh-CN',
      // 后续可根据实际 TTS SDK 格式调整请求体
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS endpoint error: ${response.status}`);
  }

  // 如果返回音频数据，播放音频
  // 此处预留音频播放逻辑，具体实现取决于 TTS SDK 返回格式
  const audioData = await response.arrayBuffer();
  // Play audio via native module or other audio player
  if (Platform.OS === 'android' && XYGTTS) {
    XYGTTS.playAudio(
      Array.from(new Uint8Array(audioData)),
    );
  }
}

async function speakViaSystem(text: string): Promise<void> {
  if (Platform.OS === 'android' && XYGTTS) {
    XYGTTS.speak(text);
    return;
  }

  // Web 环境回退：使用 Web Speech API
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

/**
 * 提取纯文本内容（去除 HTML 标签等富文本标记）
 */
export function extractPlainText(htmlContent: string): string {
  // 简单去除 HTML 标签
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