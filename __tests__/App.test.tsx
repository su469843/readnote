import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native', () => ({
  Alert: {alert: jest.fn()},
  StatusBar: () => null,
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Screen: () => null,
  }),
}));

jest.mock('../src/screens/HomeScreen', () => () => null);
jest.mock('../src/screens/NoteDetailScreen', () => () => null);
jest.mock('../src/screens/PDFViewerScreen', () => () => null);
jest.mock('../src/screens/SettingsScreen', () => () => null);
jest.mock('../src/utils/database', () => ({initDatabase: jest.fn(async () => true)}));
jest.mock('../src/utils/fileManager', () => ({ensureNotesDir: jest.fn(async () => undefined)}));
jest.mock('../src/store/useStore', () => ({
  useStore: () => ({loadSettingsFromStorage: jest.fn(async () => undefined)}),
}));

import App from '../App';

test('renders the application shell', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(renderer?.toJSON()).toBeNull();
  consoleError.mockRestore();
});
