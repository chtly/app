import SQLite3DB from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import { PostObject } from '../types/types';

const database = new SQLite3DB("posts.db");

database.pragma("journal_mode = WAL");
database.exec("CREATE TABLE IF NOT EXISTS posts (id VARCHAR, parentId VARCHAR, post VARCHAR, user VARCHAR, comment VARCHAR, date DATETIME);")

export const addPost = (post: string, user: string, comment: string, parentPost?: string | undefined): boolean => {
  const insert = database.prepare("INSERT INTO posts (id, parentId, post, user, comment, date) VALUES (@id, @parentId, @post, @user, @comment, @date)").run({
    id: uuid(),
    parentId: parentPost ? parentPost : "",
    post: post,
    user: user,
    comment: comment,
    date: new Date().getTime()
  });

  return insert.changes > 0
}

export const getPosts = (post: string): PostObject[] => {
  const fetch = database.prepare(`SELECT * FROM posts WHERE post = @post ORDER BY date DESC LIMIT 1000`).all({ post });
  return fetch as PostObject[];
}
