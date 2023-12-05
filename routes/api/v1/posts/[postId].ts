import { H3Event } from "h3";
import { addPost, getPosts } from "../../../../db/database";
import assert from "assert";
import { emojify } from 'node-emoji';
import { ZodError, z } from 'zod';

export default eventHandler(async (e: H3Event) => {
  try {
    if (e.method === "PUT") {
      let body = await readBody(e);

      assert((typeof body == "object"), "invalid body reply");

      assert("post" in body, "key 'post' is missing");
      assert("user" in body, "key 'user' is missing");
      assert("comment" in body, "key 'comment' is missing");

      const insert = addPost(e.context.params.postId as string, body.user, emojify(body.comment as string));
      return insert;
    }

    const queryParams = getQuery(e);

    let postAmount = "amount" in queryParams ? queryParams.amount : 50;
    let postOffset = "offset" in queryParams ? queryParams.offset : 0;

    postAmount = await z.number().parseAsync(postAmount, {
      path: ["amount"]
    })
    postOffset = await z.number().parseAsync(postOffset, {
      path: ["offset"]
    })

    const postId = e.context.params.postId;

    console.log(queryParams);

    const posts = getPosts(postId, postAmount, postOffset);
    return {
      posts: posts
    };
  } catch (err) {
    if (err instanceof ZodError) {
      const zodErr = err as ZodError;
      console.log(err);
      return {
        code: 500,
        message: zodErr.errors
      }
    } else {
      console.log(err);
      return {
        code: 500,
        message: err.message
      }
    }
  }
});
