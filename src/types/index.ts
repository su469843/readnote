export interface Note {
  id: number;
  title: string;
  content: string;
  pdf_path: string | null;
  json_notes_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Annotation {
  id: string;
  page: number;
  points: {x: number; y: number}[];
  color: string;
  strokeWidth: number;
}

export interface AnnotationFile {
  pdfName: string;
  annotations: Annotation[];
  version: string;
}

export interface TTSConfig {
  endpoint: string;
  enabled: boolean;
}

export interface AppSettings {
  ttsEndpoint: string;
  ttsApiKey: string;
  ttsVoice: string;
}

/** SSH 连接认证方式 */
export type SSHAuthType = 'password' | 'key';

/** SSH 连接配置 */
export interface SSHConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: SSHAuthType;
  password: string;
  privateKey: string;
  createdAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  NoteDetail: {noteId?: number};
  PDFViewer: {pdfPath: string; annotationsPath: string};
  Settings: undefined;
  SSHList: undefined;
  SSHConnect: {connectionId?: string};
  Terminal: {connectionId: string};
};
