import { H3Event } from "h3";

export default eventHandler(async (e: H3Event) => {
  return { status: 200 };
});
