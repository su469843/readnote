import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '../store/useStore';
import {SSHConnection, SSHAuthType} from '../types';
import {Colors, Spacing, FontSize, BorderRadius, Shadow} from '../theme';

function generateId(): string {
  return `ssh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export default function SSHConnectScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const connectionId = route.params?.connectionId;

  const {sshConnections, addSSHConnection, updateSSHConnection} = useStore();

  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('root');
  const [authType, setAuthType] = useState<SSHAuthType>('password');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    if (connectionId) {
      const conn = sshConnections.find((c) => c.id === connectionId);
      if (conn) {
        setName(conn.name);
        setHost(conn.host);
        setPort(String(conn.port));
        setUsername(conn.username);
        setAuthType(conn.authType);
        setPassword(conn.password);
        setPrivateKey(conn.privateKey);
      }
    }
  }, [connectionId, sshConnections]);

  const handleSave = () => {
    if (!host.trim()) {
      Alert.alert('提示', '请输入服务器地址');
      return;
    }
    if (!username.trim()) {
      Alert.alert('提示', '请输入用户名');
      return;
    }
    if (authType === 'password' && !password) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    const conn: SSHConnection = {
      id: connectionId || generateId(),
      name: name.trim() || `${username}@${host}`,
      host: host.trim(),
      port: parseInt(port, 10) || 22,
      username: username.trim(),
      authType,
      password,
      privateKey,
      createdAt: new Date().toISOString(),
    };

    if (connectionId) {
      updateSSHConnection(conn);
      Alert.alert('提示', '连接已更新');
    } else {
      addSSHConnection(conn);
      Alert.alert('提示', '连接已添加');
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {connectionId ? '编辑连接' : '新建连接'}
        </Text>
        <View style={{width: 50}} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.label}>连接名称</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例如：我的服务器"
            placeholderTextColor={Colors.textTertiary}
          />

          <Text style={styles.label}>服务器地址</Text>
          <TextInput
            style={styles.input}
            value={host}
            onChangeText={setHost}
            placeholder="192.168.1.100 或 example.com"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={styles.label}>端口</Text>
          <TextInput
            style={styles.input}
            value={port}
            onChangeText={setPort}
            placeholder="22"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="root"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>认证方式</Text>

          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[
                styles.authOption,
                authType === 'password' && styles.authOptionActive,
              ]}
              onPress={() => setAuthType('password')}>
              <Text
                style={[
                  styles.authOptionText,
                  authType === 'password' && styles.authOptionTextActive,
                ]}>
                密码
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.authOption,
                authType === 'key' && styles.authOptionActive,
              ]}
              onPress={() => setAuthType('key')}>
              <Text
                style={[
                  styles.authOptionText,
                  authType === 'key' && styles.authOptionTextActive,
                ]}>
                密钥
              </Text>
            </TouchableOpacity>
          </View>

          {authType === 'password' ? (
            <>
              <Text style={styles.label}>密码</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="输入密码"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                contextMenuHidden={false}
                textContentType="password"
              />
              <Text style={styles.hint}>
                长按输入框可粘贴密码
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>私钥内容</Text>
              <TextInput
                style={[styles.input, styles.keyInput]}
                value={privateKey}
                onChangeText={setPrivateKey}
                placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.uploadBtn}>
                <Text style={styles.uploadBtnText}>
                  选择文件上传（后续实现）
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {connectionId ? '保存修改' : '添加连接'}
          </Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
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
  keyInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.sm,
  },
  authToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  authOption: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  authOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  authOptionText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  authOptionTextActive: {
    color: Colors.textInverse,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  uploadBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
  },
  saveBtn: {
    marginTop: Spacing.xl + 4,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadow.md,
  },
  saveBtnText: {
    color: Colors.textInverse,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
