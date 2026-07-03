import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '../store/useStore';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {settings, saveSettingsToStorage} = useStore();
  const [ttsEndpoint, setTtsEndpoint] = useState(settings.ttsEndpoint);

  useEffect(() => {
    setTtsEndpoint(settings.ttsEndpoint);
  }, [settings.ttsEndpoint]);

  const handleSave = async () => {
    await saveSettingsToStorage({ttsEndpoint: ttsEndpoint.trim()});
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TTS 语音朗读</Text>
        <Text style={styles.label}>TTS 服务地址</Text>
        <TextInput
          style={styles.input}
          value={ttsEndpoint}
          onChangeText={setTtsEndpoint}
          placeholder="例如：https://your-tts-api.com/tts"
          placeholderTextColor="#bbb"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          填写自定义 TTS 服务地址后，朗读功能将使用该服务。留空则使用系统内置 TTS。
        </Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>保存设置</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <Text style={styles.aboutText}>XYG 笔记 v1.0.0</Text>
        <Text style={styles.aboutText}>
          TTS 引擎：自定义端点 / 系统内置 / Web Speech API
        </Text>
      </View>
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
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
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