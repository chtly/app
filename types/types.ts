export type PostObject = {
  id: string;
  parentId: string | undefined;
  post: string;
  user: string;
  comment: string;
  date: Date;
}
