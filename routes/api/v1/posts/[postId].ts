import { H3Event } from "h3";
import { addPost, getPosts } from "../../../../db/database";
import assert from "assert";

export default eventHandler(async (e: H3Event) => {
  try {
    if (e.method === "PUT") {
      let body = await readBody(e);

      assert((typeof body == "object"), "invalid body reply");

      assert("post" in body, "key 'post' is missing");
      assert("user" in body, "key 'user' is missing");
      assert("comment" in body, "key 'comment' is missing");

      const insert = addPost(e.context.params.postId as string, body.user, body.comment);
      return insert;
    }
    const postId = e.context.params.postId;

    const posts = getPosts(postId);
    return posts;
  } catch (err) {
    return {
      code: 500,
      message: err.message
    }
  }
});
