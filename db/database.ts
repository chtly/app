import SQLite3DB from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import { PostObject } from '../types/types';

const database = new SQLite3DB("posts.db");

database.pragma("journal_mode = WAL");
database.exec("CREATE TABLE IF NOT EXISTS posts (commentId VARCHAR, parentCommentId VARCHAR, post VARCHAR, user VARCHAR, comment VARCHAR, date DATETIME);")

export const addPost = (post: string, user: string, commentContent: string, parentComment?: string | undefined): {
  success: boolean;
  post?: PostObject;
} => {
  const postObject: PostObject = {
    commentId: uuid(),
    parentCommentId: parentComment,
    post: post,
    user: user,
    comment: commentContent,
    date: new Date()
  }
  const insert = database.prepare("INSERT INTO posts (commentId, parentCommentId, post, user, comment, date) VALUES (@commentId, @parentCommentId, @post, @user, @comment, @date)").run({
    commentId: uuid(),
    parentCommentId: postObject.parentCommentId ? postObject.parentCommentId : "",
    post: postObject.post,
    user: postObject.user,
    comment: postObject.comment,
    date: postObject.date.getTime()
  });

  return {
    success: insert.changes > 0,
    post: insert.changes > 0 ? postObject : undefined
  }
}

export const getPosts = (post: string, amount?: number | undefined, offset?: number | undefined): PostObject[] => {
  const fetch = database.prepare(`SELECT * FROM posts WHERE post = @post ORDER BY date DESC LIMIT @offset, @amount`).all({ post, amount, offset });
  return fetch as PostObject[];
}
