import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import PDFViewerScreen from './src/screens/PDFViewerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {initDatabase} from './src/utils/database';
import {ensureNotesDir} from './src/utils/fileManager';
import {useStore} from './src/store/useStore';
import {RootStackParamList} from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const {loadSettingsFromStorage} = useStore();

  useEffect(() => {
    async function init() {
      await initDatabase();
      await ensureNotesDir();
      await loadSettingsFromStorage();
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}