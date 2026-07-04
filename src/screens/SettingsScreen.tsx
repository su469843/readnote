import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '../store/useStore';

const VOICE_OPTIONS = [
  {label: '晓晓 (温暖女声)', value: 'zh-CN-XiaoxiaoNeural'},
  {label: '云希 (稳重男声)', value: 'zh-CN-YunxiNeural'},
  {label: '晓伊 (亲切女声)', value: 'zh-CN-XiaoyiNeural'},
  {label: '云扬 (专业男声)', value: 'zh-CN-YunyangNeural'},
  {label: '晓涵 (清新女声)', value: 'zh-CN-XiaohanNeural'},
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {settings, saveSettingsToStorage} = useStore();
  const [ttsEndpoint, setTtsEndpoint] = useState(settings.ttsEndpoint);
  const [ttsApiKey, setTtsApiKey] = useState(settings.ttsApiKey);
  const [ttsVoice, setTtsVoice] = useState(settings.ttsVoice);

  useEffect(() => {
    setTtsEndpoint(settings.ttsEndpoint);
    setTtsApiKey(settings.ttsApiKey);
    setTtsVoice(settings.ttsVoice);
  }, [settings.ttsEndpoint, settings.ttsApiKey, settings.ttsVoice]);

  const handleSave = async () => {
    await saveSettingsToStorage({
      ttsEndpoint: ttsEndpoint.trim(),
      ttsApiKey: ttsApiKey.trim(),
      ttsVoice,
    });
    Alert.alert('提示', '设置已保存', [{text: '确定'}]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>设置</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TTS 语音朗读</Text>

          <Text style={styles.label}>Edge TTS 服务地址</Text>
          <TextInput
            style={styles.input}
            value={ttsEndpoint}
            onChangeText={setTtsEndpoint}
            placeholder="https://your-worker.workers.dev"
            placeholderTextColor="#bbb"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>API Key（可选）</Text>
          <TextInput
            style={styles.input}
            value={ttsApiKey}
            onChangeText={setTtsApiKey}
            placeholder="Bearer Token（留空则不验证）"
            placeholderTextColor="#bbb"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          <Text style={styles.label}>语音角色</Text>
          <View style={styles.voiceList}>
            {VOICE_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v.value}
                style={[
                  styles.voiceOption,
                  ttsVoice === v.value && styles.voiceOptionActive,
                ]}
                onPress={() => setTtsVoice(v.value)}>
                <Text
                  style={[
                    styles.voiceOptionText,
                    ttsVoice === v.value && styles.voiceOptionTextActive,
                  ]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.hint}>
            填入 Edge TTS Worker 地址后将使用云端微软语音合成。留空则使用系统内置 TTS 引擎。
          </Text>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>保存设置</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <Text style={styles.aboutText}>XYG 笔记 v1.0.0</Text>
          <Text style={styles.aboutText}>
            TTS：Edge TTS Worker / 系统内置 / Web Speech
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backText: {
    fontSize: 16,
    color: '#4A90D9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  voiceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  voiceOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  voiceOptionActive: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
  },
  voiceOptionText: {
    fontSize: 13,
    color: '#666',
  },
  voiceOptionTextActive: {
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    lineHeight: 18,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#4A90D9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
