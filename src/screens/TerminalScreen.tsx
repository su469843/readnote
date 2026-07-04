import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  NativeModules,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '../store/useStore';
import {Colors, Spacing, FontSize, BorderRadius} from '../theme';

const {XYGSSH} = NativeModules;

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

interface LogEntry {
  type: 'input' | 'output' | 'error' | 'info' | 'system';
  text: string;
  timestamp: string;
}

export default function TerminalScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const {connectionId} = route.params;
  const {sshConnections} = useStore();

  const conn = sshConnections.find((c) => c.id === connectionId);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (conn) {
      addLog('system', `准备连接 ${conn.username}@${conn.host}:${conn.port}...`);
    }
  }, []);

  const addLog = (type: LogEntry['type'], text: string) => {
    const entry: LogEntry = {
      type,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [...prev, entry]);
    setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 100);
  };

  const handleConnect = async () => {
    if (!conn || !XYGSSH) {
      addLog('error', 'SSH 模块不可用');
      return;
    }

    setConnecting(true);
    addLog('info', `正在连接 ${conn.host}:${conn.port}...`);

    try {
      await XYGSSH.connect(
        conn.host,
        conn.port,
        conn.username,
        conn.password || '',
        conn.privateKey || '',
        conn.authType,
      );
      setConnected(true);
      addLog('system', `✓ 已连接到 ${conn.username}@${conn.host}`);
      setTimeout(() => inputRef.current?.focus(), 300);
    } catch (e: any) {
      addLog('error', `✗ 连接失败: ${e.message || '未知错误'}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await XYGSSH?.disconnect();
      setConnected(false);
      addLog('system', '已断开连接');
    } catch {
      addLog('error', '断开连接失败');
    }
  };

  const handleSendCommand = async () => {
    const cmd = command.trim();
    if (!cmd || !connected || !XYGSSH) return;

    setCommand('');
    addLog('input', `$ ${cmd}`);

    try {
      const result: CommandResult = await XYGSSH.execCommand(cmd);
      if (result.stdout) {
        addLog('output', result.stdout);
      }
      if (result.stderr) {
        addLog('error', result.stderr);
      }
      addLog('info', `退出码: ${result.exitCode}`);
    } catch (e: any) {
      addLog('error', `命令错误: ${e.message || '执行失败'}`);
    }
  };

  const getLogColor = (type: LogEntry['type']): string => {
    switch (type) {
      case 'input':
        return Colors.textTerminal;
      case 'output':
        return '#E6EDF3';
      case 'error':
        return '#FF6B6B';
      case 'info':
        return Colors.textTertiary;
      case 'system':
        return Colors.success;
      default:
        return '#E6EDF3';
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: connected ? Colors.success : Colors.textTertiary},
            ]}
          />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {conn?.name || '终端'}
          </Text>
        </View>
        {connected ? (
          <TouchableOpacity onPress={handleDisconnect}>
            <Text style={styles.disconnectText}>断开</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleConnect}
            disabled={connecting}>
            <Text style={styles.connectText}>
              {connecting ? '连接中...' : '连接'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 终端输出 */}
      <ScrollView
        ref={scrollRef}
        style={styles.terminal}
        contentContainerStyle={styles.terminalContent}
        showsVerticalScrollIndicator={false}>
        {logs.length === 0 && !conn && (
          <Text style={styles.placeholder}>连接信息未找到</Text>
        )}
        {logs.length === 0 && conn && !connecting && !connected && (
          <Text style={styles.placeholder}>
            点击右上角「连接」开始{'\n'}
            长按输入框可粘贴命令
          </Text>
        )}
        {connecting && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.textTerminal} />
            <Text style={styles.loadingText}>连接中...</Text>
          </View>
        )}
        {logs.map((log, i) => (
          <Text
            key={i}
            style={[styles.logLine, {color: getLogColor(log.type)}]}>
            {log.text}
          </Text>
        ))}
      </ScrollView>

      {/* 输入栏 */}
      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={styles.commandInput}
          value={command}
          onChangeText={setCommand}
          placeholder={connected ? '输入命令...' : '请先连接服务器'}
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          editable={connected}
          onSubmitEditing={handleSendCommand}
          returnKeyType="send"
          contextMenuHidden={false}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            !connected && styles.sendBtnDisabled,
          ]}
          onPress={handleSendCommand}
          disabled={!connected}>
          <Text style={styles.sendBtnText}>↵</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgTerminal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: Spacing.md,
    backgroundColor: '#161B22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '500',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#E6EDF3',
  },
  connectText: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: '600',
  },
  disconnectText: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: '600',
  },
  terminal: {
    flex: 1,
  },
  terminalContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: '100%',
  },
  placeholder: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  loadingText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    marginLeft: Spacing.sm,
  },
  logLine: {
    fontSize: FontSize.sm,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginBottom: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#161B22',
    borderTopWidth: 1,
    borderTopColor: '#30363D',
  },
  commandInput: {
    flex: 1,
    backgroundColor: '#0D1117',
    color: '#E6EDF3',
    fontSize: FontSize.sm,
    fontFamily: 'monospace',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#30363D',
    maxHeight: 40,
  },
  sendBtn: {
    marginLeft: Spacing.sm,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  sendBtnText: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
});
