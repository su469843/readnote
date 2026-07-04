import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '../store/useStore';
import {Colors, Spacing, FontSize, BorderRadius, Shadow} from '../theme';

const APP_VERSION = '1.3.1';

const VOICE_OPTIONS = [
  {label: '晓晓 (温暖女声)', value: 'zh-CN-XiaoxiaoNeural'},
  {label: '云希 (稳重男声)', value: 'zh-CN-YunxiNeural'},
  {label: '晓伊 (亲切女声)', value: 'zh-CN-XiaoyiNeural'},
  {label: '云扬 (专业男声)', value: 'zh-CN-YunyangNeural'},
  {label: '晓涵 (清新女声)', value: 'zh-CN-XiaohanNeural'},
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const {
    settings,
    terminalMode,
    saveSettingsToStorage,
    setTerminalMode,
  } = useStore();
  const [ttsEndpoint, setTtsEndpoint] = useState(settings.ttsEndpoint);
  const [ttsApiKey, setTtsApiKey] = useState(settings.ttsApiKey);
  const [ttsVoice, setTtsVoice] = useState(settings.ttsVoice);

  useEffect(() => {
    setTtsEndpoint(settings.ttsEndpoint);
    setTtsApiKey(settings.ttsApiKey);
    setTtsVoice(settings.ttsVoice);
  }, [settings.ttsEndpoint, settings.ttsApiKey, settings.ttsVoice]);

  const handleSave = async () => {
    try {
      await saveSettingsToStorage({
        ttsEndpoint: ttsEndpoint.trim(),
        ttsApiKey: ttsApiKey.trim(),
        ttsVoice,
      });
      Alert.alert('提示', '设置已保存', [{text: '确定'}]);
    } catch (e) {
      console.warn('保存设置失败:', e);
      Alert.alert('错误', '保存设置失败');
    }
  };

  const handleTerminalToggle = (value: boolean) => {
    setTerminalMode(value);
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
        {/* 终端模式 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🖥 终端模式</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>开启终端模式</Text>
              <Text style={styles.rowDesc}>
                启用后可在侧边栏管理 SSH 连接
              </Text>
            </View>
            <Switch
              value={terminalMode}
              onValueChange={handleTerminalToggle}
              trackColor={{false: '#D1D5DB', true: Colors.primaryLight}}
              thumbColor={terminalMode ? Colors.primary : '#F9FAFB'}
            />
          </View>

          {terminalMode && (
            <TouchableOpacity
              style={styles.sshManageBtn}
              onPress={() => navigation.navigate('SSHList')}>
              <Text style={styles.sshManageText}>管理 SSH 连接 →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TTS 设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔊 TTS 语音朗读</Text>

          <Text style={styles.label}>Edge TTS 服务地址</Text>
          <TextInput
            style={styles.input}
            value={ttsEndpoint}
            onChangeText={setTtsEndpoint}
            placeholder="https://your-worker.workers.dev"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>API Key（可选）</Text>
          <TextInput
            style={styles.input}
            value={ttsApiKey}
            onChangeText={setTtsApiKey}
            placeholder="Bearer Token（留空则不验证）"
            placeholderTextColor={Colors.textTertiary}
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

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ 关于</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>应用版本</Text>
            <Text style={styles.aboutValue}>v{APP_VERSION}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>TTS 引擎</Text>
            <Text style={styles.aboutValue}>Edge TTS / 系统内置 / Web Speech</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>运行平台</Text>
            <Text style={styles.aboutValue}>Android</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.bgCard,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  rowTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  rowDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sshManageBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  sshManageText: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
  },
  voiceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 4,
  },
  voiceOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  voiceOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  voiceOptionText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  voiceOptionTextActive: {
    color: Colors.textInverse,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
    lineHeight: 16,
  },
  saveBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  aboutLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  aboutValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
});
