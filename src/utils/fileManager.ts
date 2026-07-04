import {NativeModules} from 'react-native';
import {AnnotationFile} from '../types';

/**
 * 文件系统管理器 - 直接访问 RNFSManager 原生模块（延迟加载）
 *
 * 不使用 react-native-fs 库，因为该库在模块加载时立即访问原生模块，
 * 在 RN 0.86 运行时中会导致 "[runtime not ready]" 崩溃。
 * 改为在函数内部延迟获取原生模块，确保运行时已初始化。
 */

function getRNFSManager() {
  const mgr = NativeModules.RNFSManager;
  if (!mgr) {
    console.warn('RNFSManager 原生模块不可用，文件操作将被禁用');
  }
  return mgr;
}

function getNotesDir(): string {
  const mgr = getRNFSManager();
  const docDir = mgr ? mgr.RNFSDocumentDirectoryPath : null;
  return `${docDir || '/data/data'}/notes`;
}

export function getCachesDir(): string {
  const mgr = getRNFSManager();
  return mgr ? mgr.RNFSCachesDirectoryPath : '/data/data/cache';
}

export async function rnfsWriteFile(
  filepath: string,
  contents: string,
  encoding: string,
): Promise<void> {
  const mgr = getRNFSManager();
  if (!mgr) throw new Error('文件系统不可用');
  const normalized = filepath.startsWith('file://')
    ? filepath.slice(7)
    : filepath;
  await mgr.writeFile(normalized, contents, {encoding});
}

export async function ensureNotesDir(): Promise<void> {
  try {
    const mgr = getRNFSManager();
    if (!mgr) {
      console.warn('RNFSManager 不可用，跳过创建目录');
      return;
    }
    const NOTES_DIR = getNotesDir();
    const exists = await mgr.exists(NOTES_DIR);
    if (!exists) {
      await mgr.mkdir(NOTES_DIR, {});
    }
  } catch (e) {
    console.warn('ensureNotesDir 失败:', e);
  }
}

export async function copyPdfToNotes(
  sourceUri: string,
  fileName: string,
): Promise<string> {
  const mgr = getRNFSManager();
  if (!mgr) throw new Error('文件系统不可用');
  await ensureNotesDir();
  const destPath = `${getNotesDir()}/${fileName}`;
  const src = sourceUri.startsWith('file://')
    ? sourceUri.slice(7)
    : sourceUri;
  const dest = destPath.startsWith('file://') ? destPath.slice(7) : destPath;
  await mgr.copyFile(src, dest, {});
  return destPath;
}

export function getAnnotationsPath(pdfPath: string): string {
  const baseName = pdfPath.replace(/\.[^.]+$/, '');
  return `${baseName}_notes.json`;
}

export async function loadAnnotations(
  annotationsPath: string,
): Promise<AnnotationFile> {
  const mgr = getRNFSManager();
  if (!mgr) {
    return {pdfName: '', annotations: [], version: '1.0'};
  }
  try {
    const normalized = annotationsPath.startsWith('file://')
      ? annotationsPath.slice(7)
      : annotationsPath;
    const exists = await mgr.exists(normalized);
    if (exists) {
      const b64 = await mgr.readFile(normalized);
      const raw = decodeBase64AsUtf8(b64);
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('loadAnnotations 失败:', e);
  }
  return {pdfName: '', annotations: [], version: '1.0'};
}

export async function saveAnnotations(
  annotationsPath: string,
  data: AnnotationFile,
): Promise<void> {
  const mgr = getRNFSManager();
  if (!mgr) throw new Error('文件系统不可用');
  const normalized = annotationsPath.startsWith('file://')
    ? annotationsPath.slice(7)
    : annotationsPath;
  const content = JSON.stringify(data, null, 2);
  const b64 = encodeUtf8AsBase64(content);
  await mgr.writeFile(normalized, b64, {});
}

export async function deleteNoteFiles(
  pdfPath: string | null,
  annotationsPath: string | null,
): Promise<void> {
  const mgr = getRNFSManager();
  if (!mgr) return;
  try {
    if (pdfPath) {
      const normalized = pdfPath.startsWith('file://')
        ? pdfPath.slice(7)
        : pdfPath;
      const exists = await mgr.exists(normalized);
      if (exists) {
        await mgr.unlink(normalized);
      }
    }
    if (annotationsPath) {
      const normalized = annotationsPath.startsWith('file://')
        ? annotationsPath.slice(7)
        : annotationsPath;
      const exists = await mgr.exists(normalized);
      if (exists) {
        await mgr.unlink(normalized);
      }
    }
  } catch (e) {
    console.warn('deleteNoteFiles 失败:', e);
  }
}

// ---- Base64 / UTF-8 工具函数 ----

function encodeUtf8AsBase64(input: string): string {
  // 使用 RN 内置的 base64 编码：先将 UTF-8 字符串转为 base64
  // react-native-fs 的 writeFile 接受 base64 编码的内容
  try {
    // Hermes 引擎支持 btoa
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return input;
  }
}

function decodeBase64AsUtf8(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return b64;
  }
}
