import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DocumentPicker from 'react-native-document-picker';
import TTSButton from '../components/TTSButton';
import {useStore} from '../store/useStore';
import {getNoteById, updateNote} from '../utils/database';
import {copyPdfToNotes, getAnnotationsPath} from '../utils/fileManager';
import {RootStackParamList, Note} from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>;

export default function NoteDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NavigationProp>();
  const noteId = route.params?.noteId;

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleInputRef = useRef<TextInput>(null);
  const {updateNoteInList} = useStore();

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    const data = await getNoteById(noteId);
    if (data) {
      setNote(data);
      setTitle(data.title);
      setContent(data.content);
    }
  };

  const saveNote = async () => {
    if (!note) return;
    await updateNote(note.id, {title, content});
    const updated = {...note, title, content};
    setNote(updated);
    updateNoteInList(updated);
  };

  const handleAttachPDF = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      if (result[0] && note) {
        const fileName = result[0].name || `doc_${Date.now()}.pdf`;
        const pdfPath = await copyPdfToNotes(
          decodeURIComponent(result[0].uri),
          fileName,
        );
        const annotationsPath = getAnnotationsPath(pdfPath);

        await updateNote(note.id, {
          pdf_path: pdfPath,
          json_notes_path: annotationsPath,
        });
        const updated = {
          ...note,
          pdf_path: pdfPath,
          json_notes_path: annotationsPath,
        };
        setNote(updated);
        updateNoteInList(updated);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('错误', 'PDF 文件选择失败');
      }
    }
  };

  const handleOpenPDF = () => {
    if (note?.pdf_path && note?.json_notes_path) {
      navigation.navigate('PDFViewer', {
        pdfPath: note.pdf_path,
        annotationsPath: note.json_notes_path,
      });
    }
  };

  const handleBack = () => {
    saveNote();
    navigation.goBack();
  };

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveNote} style={styles.saveBtn}>
          <Text style={styles.saveText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        <TextInput
          ref={titleInputRef}
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="笔记标题"
          placeholderTextColor="#bbb"
          onBlur={saveNote}
        />

        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="开始写笔记..."
          placeholderTextColor="#ccc"
          multiline
          textAlignVertical="top"
          onBlur={saveNote}
        />

        {note.pdf_path ? (
          <TouchableOpacity style={styles.pdfBanner} onPress={handleOpenPDF}>
            <Text style={styles.pdfBannerText}>📎 已附加 PDF 文件 - 点击查看</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={handleAttachPDF}>
          <Text style={styles.toolIcon}>📎</Text>
          <Text style={styles.toolLabel}>附件</Text>
        </TouchableOpacity>

        <TTSButton content={content} />

        {note.pdf_path ? (
          <TouchableOpacity style={styles.toolBtn} onPress={handleOpenPDF}>
            <Text style={styles.toolIcon}>✏️</Text>
            <Text style={styles.toolLabel}>标注</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: '#4A90D9',
  },
  saveBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  saveText: {
    fontSize: 16,
    color: '#4A90D9',
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 200,
  },
  pdfBanner: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4A90D9',
  },
  pdfBannerText: {
    fontSize: 14,
    color: '#4A90D9',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  toolBtn: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  toolIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  toolLabel: {
    fontSize: 12,
    color: '#666',
  },
  loading: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#999',
  },
});