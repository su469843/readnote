import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppSettings, SSHConnection} from '../types';

const SETTINGS_KEY = '@xyg_notes_settings';
const SSH_CONNECTIONS_KEY = '@xyg_notes_ssh_connections';

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

/** 加载所有 SSH 连接配置 */
export async function loadSSHConnections(): Promise<SSHConnection[]> {
  try {
    const raw = await AsyncStorage.getItem(SSH_CONNECTIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

/** 保存所有 SSH 连接配置 */
export async function saveSSHConnections(
  connections: SSHConnection[],
): Promise<void> {
  await AsyncStorage.setItem(
    SSH_CONNECTIONS_KEY,
    JSON.stringify(connections),
  );
}
