import { H3Event } from "h3";
import { addComment, getComments } from "../../../db/database";
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

      const insert = addComment(e.context.params.postId as string, body.user, emojify(body.comment as string));
      return insert;
    }

    const queryParams = getQuery(e);

    let postAmount = "amount" in queryParams ? parseInt(queryParams.amount as string) : 50;
    let postOffset = "offset" in queryParams ? parseInt(queryParams.offset as string) : 0;

    postAmount = await z.number().parseAsync(postAmount, {
      path: ["amount"],
    })
    postOffset = await z.number().parseAsync(postOffset, {
      path: ["offset"]
    })

    const postId = e.context.params.postId;

    const comments = getComments(postId, postAmount, postOffset);
    return {
      comments
    };
  } catch (err) {
    if (err instanceof ZodError) {
      const zodErr = err as ZodError;
      return {
        code: 500,
        message: zodErr.errors
      }
    } else {
      return {
        code: 500,
        message: err.message
      }
    }
  }
});
