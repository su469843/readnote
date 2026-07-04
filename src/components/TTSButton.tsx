import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {speakText, stopSpeaking, extractPlainText} from '../utils/ttsManager';

interface TTSButtonProps {
  content: string;
  size?: 'small' | 'medium';
}

export default function TTSButton({content, size = 'medium'}: TTSButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePress = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const plainText = extractPlainText(content);
      if (plainText) {
        await speakText(plainText);
      }
    } catch (err) {
      console.warn('TTS error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={[styles.button, isSmall && styles.buttonSmall]}
      onPress={handlePress}
      activeOpacity={0.7}>
      {isSpeaking ? (
        <ActivityIndicator size={isSmall ? 'small' : 'small'} color="#fff" />
      ) : (
        <Text style={[styles.icon, isSmall && styles.iconSmall]}>
          {isSpeaking ? '⏹' : '🔊'}
        </Text>
      )}
      {!isSmall && (
        <Text style={styles.label}>{isSpeaking ? '停止' : '朗读'}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90D9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  icon: {
    fontSize: 18,
  },
  iconSmall: {
    fontSize: 14,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
