import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Note} from '../types';
import {Colors, Spacing, FontSize, BorderRadius, Shadow} from '../theme';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function NoteCard({note, onPress, onLongPress}: NoteCardProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
        {note.pdf_path ? <Text style={styles.pdfIcon}>📎</Text> : null}
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
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs + 2,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  pdfIcon: {
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  preview: {
    fontSize: FontSize.sm + 1,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
