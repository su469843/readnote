import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppSettings} from '../types';

const SETTINGS_KEY = '@xyg_notes_settings';

const defaultSettings: AppSettings = {
  ttsEndpoint: '',
  ttsApiKey: '',
  ttsVoice: 'zh-CN-XiaoxiaoNeural',
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return {...defaultSettings, ...JSON.parse(raw)};
    }
  } catch {}
  return defaultSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}