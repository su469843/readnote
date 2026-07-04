import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStore} from '../store/useStore';
import {SSHConnection} from '../types';
import {Colors, Spacing, FontSize, BorderRadius, Shadow} from '../theme';

export default function SSHListScreen() {
  const navigation = useNavigation<any>();
  const {sshConnections, loadSSHConnectionsFromStorage, removeSSHConnection} =
    useStore();

  useFocusEffect(
    React.useCallback(() => {
      loadSSHConnectionsFromStorage();
    }, []),
  );

  const handleDelete = (conn: SSHConnection) => {
    Alert.alert('删除连接', `确定删除「${conn.name}」吗？`, [
      {text: '取消', style: 'cancel'},
      {
        text: '删除',
        style: 'destructive',
        onPress: () => removeSSHConnection(conn.id),
      },
    ]);
  };

  const renderItem = ({item}: {item: SSHConnection}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Terminal', {connectionId: item.id})}
      onLongPress={() => {
        Alert.alert(item.name, undefined, [
          {
            text: '编辑',
            onPress: () =>
              navigation.navigate('SSHConnect', {connectionId: item.id}),
          },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => handleDelete(item),
          },
          {text: '取消', style: 'cancel'},
        ]);
      }}
      activeOpacity={0.7}>
      <View style={styles.cardLeft}>
        <View style={styles.statusDot} />
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            {item.username}@{item.host}:{item.port}
          </Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SSH 终端</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SSHConnect', {})}>
          <Text style={styles.addText}>+ 新建</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sshConnections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🖥</Text>
            <Text style={styles.emptyText}>暂无连接</Text>
            <Text style={styles.emptySubtext}>点击右上角 + 新建添加服务器</Text>
          </View>
        }
      />
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
  addText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  list: {
    paddingVertical: Spacing.sm,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs + 2,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadow.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textTertiary,
    marginRight: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
});
