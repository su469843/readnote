import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import NoteCard from '../components/NoteCard';
import Sidebar from '../components/Sidebar';
import {useStore} from '../store/useStore';
import {getAllNotes, createNote, deleteNote} from '../utils/database';
import {deleteNoteFiles} from '../utils/fileManager';
import {RootStackParamList} from '../types';
import {Colors, Spacing, FontSize, BorderRadius, Shadow} from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {notes, setNotes, removeNote, terminalMode} = useStore();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, []),
  );

  const loadNotes = async () => {
    const allNotes = await getAllNotes();
    setNotes(allNotes);
  };

  const handleCreateNote = async () => {
    const id = await createNote();
    navigation.navigate('NoteDetail', {noteId: id});
  };

  const handleDeleteNote = (
    id: number,
    pdfPath: string | null,
    annotationsPath: string | null,
  ) => {
    Alert.alert('删除笔记', '确定要删除这条笔记吗？', [
      {text: '取消', style: 'cancel'},
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(id);
          await deleteNoteFiles(pdfPath, annotationsPath);
          removeNote(id);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {terminalMode && (
            <TouchableOpacity
              onPress={() => setSidebarVisible(true)}
              style={styles.menuBtn}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>ReadNote</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <NoteCard
            note={item}
            onPress={() =>
              navigation.navigate('NoteDetail', {noteId: item.id})
            }
            onLongPress={() =>
              handleDeleteNote(item.id, item.pdf_path, item.json_notes_path)
            }
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无笔记</Text>
            <Text style={styles.emptySubtext}>点击下方 + 按钮创建</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateNote}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    marginRight: Spacing.md,
    padding: 2,
  },
  menuIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingsBtn: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 22,
  },
  list: {
    paddingVertical: Spacing.sm,
    paddingBottom: 80,
  },
  empty: {
    alignItems: 'center',
    marginTop: 120,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  fabText: {
    fontSize: 28,
    color: Colors.textInverse,
    lineHeight: 30,
  },
});
