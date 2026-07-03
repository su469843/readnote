import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Note} from '../types';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function NoteCard({note, onPress, onLongPress}: NoteCardProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title || '无标题'}
        </Text>
        {note.pdf_path ? (
          <Text style={styles.pdfIcon}>📎</Text>
        ) : null}
      </View>
      <Text style={styles.preview} numberOfLines={2}>
        {note.content.replace(/<[^>]*>/g, '').trim() || '暂无内容'}
      </Text>
      <Text style={styles.date}>{formatDate(note.updated_at)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  pdfIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  preview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});