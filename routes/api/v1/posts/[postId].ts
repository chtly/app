import { H3Event } from "h3";
import { addPost, getPosts } from "../../../../db/database";

export default eventHandler(async (e: H3Event) => {
  if (e.method === "PUT") {
    const insert = addPost(e.context.params.postId as string, "test", "test");
    return insert;
  }
  const postId = e.context.params.postId;

  const posts = getPosts(postId);
  return posts;
});
