import React, {useEffect, useState} from 'react';
import {StatusBar, Alert, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import PDFViewerScreen from './src/screens/PDFViewerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SSHListScreen from './src/screens/SSHListScreen';
import SSHConnectScreen from './src/screens/SSHConnectScreen';
import TerminalScreen from './src/screens/TerminalScreen';
import {initDatabase} from './src/utils/database';
import {ensureNotesDir} from './src/utils/fileManager';
import {useStore} from './src/store/useStore';
import {RootStackParamList} from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const {loadSettingsFromStorage} = useStore();

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        await ensureNotesDir();
        await loadSettingsFromStorage();
      } catch (error) {
        console.error('App initialization failed:', error);
        Alert.alert(
          '初始化失败',
          '应用初始化时出现问题，请重启应用。' + (error instanceof Error ? error.message : ''),
        );
      }
    }
    init();
  }, [loadSettingsFromStorage]);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
        <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SSHList" component={SSHListScreen} />
        <Stack.Screen name="SSHConnect" component={SSHConnectScreen} />
        <Stack.Screen name="Terminal" component={TerminalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
