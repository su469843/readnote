import SQLite, {
  SQLiteDatabase,
  ResultSet,
} from 'react-native-sqlite-storage';
import {Note} from '../types';

SQLite.enablePromise(true);

let db: SQLiteDatabase;

const DB_NAME = 'xyg_notes.db';

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabase({
    name: DB_NAME,
    location: 'default',
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
}

export async function getAllNotes(): Promise<Note[]> {
  const [results]: [ResultSet] = await db.executeSql(
    'SELECT * FROM notes ORDER BY updated_at DESC',
  );
  const notes: Note[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    notes.push(results.rows.item(i));
  }
  return notes;
}

export async function getNoteById(id: number): Promise<Note | null> {
  const [results]: [ResultSet] = await db.executeSql(
    'SELECT * FROM notes WHERE id = ?',
    [id],
  );
  if (results.rows.length > 0) {
    return results.rows.item(0);
  }
  return null;
}

export async function createNote(
  title: string = '',
  content: string = '',
): Promise<number> {
  const [results]: [ResultSet] = await db.executeSql(
    'INSERT INTO notes (title, content) VALUES (?, ?)',
    [title, content],
  );
  return results.insertId;
}

export async function updateNote(
  id: number,
  fields: Partial<Pick<Note, 'title' | 'content' | 'pdf_path' | 'json_notes_path'>>,
): Promise<void> {
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
}

export async function deleteNote(id: number): Promise<void> {
  await db.executeSql('DELETE FROM notes WHERE id = ?', [id]);
}
