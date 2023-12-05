export type PostObject = {
  commentId: string;
  parentCommentId: string | undefined;
  post: string;
  user: string;
  comment: string;
  date: Date;
}
