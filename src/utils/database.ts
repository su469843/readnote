import {NativeModules} from 'react-native';
import {Note} from '../types';

// 延迟加载 SQLite，避免模块加载时原生模块未就绪导致崩溃
let SQLite: any = null;
let sqliteEnabled = false;

function getSQLite() {
  if (!SQLite) {
    try {
      SQLite = require('react-native-sqlite-storage');
      SQLite.enablePromise(true);
      sqliteEnabled = true;
    } catch (e) {
      console.warn('react-native-sqlite-storage 加载失败:', e);
      sqliteEnabled = false;
    }
  }
  return SQLite;
}

// 检查原生模块是否可用
export function isSQLiteAvailable(): boolean {
  return !!NativeModules.SQLite;
}

let db: any = null;
const DB_NAME = 'xyg_notes.db';

export async function initDatabase(): Promise<boolean> {
  // 检查原生模块
  if (!isSQLiteAvailable()) {
    console.warn('SQLite 原生模块不可用，数据库功能将被禁用');
    return false;
  }

  try {
    const sqlite = getSQLite();
    if (!sqliteEnabled || !sqlite) {
      console.warn('SQLite 初始化失败');
      return false;
    }

    db = await sqlite.openDatabase({
      name: DB_NAME,
    });

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        pdf_path TEXT,
        json_notes_path TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
      )
    `);
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
}

function checkDb() {
  if (!db) {
    throw new Error('数据库未初始化');
  }
}

export async function getAllNotes(): Promise<Note[]> {
  try {
    checkDb();
    const [results] = await db.executeSql(
      'SELECT * FROM notes ORDER BY updated_at DESC',
    );
    const notes: Note[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      notes.push(results.rows.item(i));
    }
    return notes;
  } catch (error) {
    console.warn('获取笔记失败:', error);
    return [];
  }
}

export async function getNoteById(id: number): Promise<Note | null> {
  try {
    checkDb();
    const [results] = await db.executeSql(
      'SELECT * FROM notes WHERE id = ?',
      [id],
    );
    if (results.rows.length > 0) {
      return results.rows.item(0);
    }
    return null;
  } catch (error) {
    console.warn('获取笔记详情失败:', error);
    return null;
  }
}

export async function createNote(
  title: string = '',
  content: string = '',
): Promise<number> {
  try {
    checkDb();
    const [results] = await db.executeSql(
      'INSERT INTO notes (title, content) VALUES (?, ?)',
      [title, content],
    );
    return results.insertId;
  } catch (error) {
    console.warn('创建笔记失败:', error);
    return -1;
  }
}

export async function updateNote(
  id: number,
  fields: Partial<Pick<Note, 'title' | 'content' | 'pdf_path' | 'json_notes_path'>>,
): Promise<void> {
  try {
    checkDb();
    const sets: string[] = [];
    const values: any[] = [];

    if (fields.title !== undefined) {
      sets.push('title = ?');
      values.push(fields.title);
    }
    if (fields.content !== undefined) {
      sets.push('content = ?');
      values.push(fields.content);
    }
    if (fields.pdf_path !== undefined) {
      sets.push('pdf_path = ?');
      values.push(fields.pdf_path);
    }
    if (fields.json_notes_path !== undefined) {
      sets.push('json_notes_path = ?');
      values.push(fields.json_notes_path);
    }

    sets.push("updated_at = datetime('now','localtime')");
    values.push(id);

    await db.executeSql(`UPDATE notes SET ${sets.join(', ')} WHERE id = ?`, values);
  } catch (error) {
    console.warn('更新笔记失败:', error);
  }
}

export async function deleteNote(id: number): Promise<void> {
  try {
    checkDb();
    await db.executeSql('DELETE FROM notes WHERE id = ?', [id]);
  } catch (error) {
    console.warn('删除笔记失败:', error);
  }
}
