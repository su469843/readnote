import RNFS from 'react-native-fs';
import {AnnotationFile} from '../types';

// 延迟获取路径，避免模块加载时原生模块未就绪
function getNotesDir(): string {
  return `${RNFS.DocumentDirectoryPath || '/data/data'}/notes`;
}

export async function ensureNotesDir(): Promise<void> {
  try {
    const NOTES_DIR = getNotesDir();
    const exists = await RNFS.exists(NOTES_DIR);
    if (!exists) {
      await RNFS.mkdir(NOTES_DIR);
    }
  } catch (e) {
    console.warn('ensureNotesDir 失败:', e);
  }
}

export async function copyPdfToNotes(
  sourceUri: string,
  fileName: string,
): Promise<string> {
  await ensureNotesDir();
  const destPath = `${getNotesDir()}/${fileName}`;
  await RNFS.copyFile(sourceUri, destPath);
  return destPath;
}

export function getAnnotationsPath(pdfPath: string): string {
  const baseName = pdfPath.replace(/\.[^.]+$/, '');
  return `${baseName}_notes.json`;
}

export async function loadAnnotations(
  annotationsPath: string,
): Promise<AnnotationFile> {
  const exists = await RNFS.exists(annotationsPath);
  if (exists) {
    const raw = await RNFS.readFile(annotationsPath, 'utf8');
    return JSON.parse(raw);
  }
  return {
    pdfName: '',
    annotations: [],
    version: '1.0',
  };
}

export async function saveAnnotations(
  annotationsPath: string,
  data: AnnotationFile,
): Promise<void> {
  await RNFS.writeFile(annotationsPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function deleteNoteFiles(
  pdfPath: string | null,
  annotationsPath: string | null,
): Promise<void> {
  if (pdfPath) {
    const exists = await RNFS.exists(pdfPath);
    if (exists) {
      await RNFS.unlink(pdfPath);
    }
  }
  if (annotationsPath) {
    const exists = await RNFS.exists(annotationsPath);
    if (exists) {
      await RNFS.unlink(annotationsPath);
    }
  }
}
