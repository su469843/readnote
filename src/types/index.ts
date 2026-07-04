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

export type RootStackParamList = {
  Home: undefined;
  NoteDetail: {noteId?: number};
  PDFViewer: {pdfPath: string; annotationsPath: string};
  Settings: undefined;
};
