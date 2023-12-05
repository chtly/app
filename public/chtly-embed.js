import $ from "./module/cash.js";

const getScriptTag = () =>
  Array.from($("script")).find((script) =>
    script.src.endsWith("chtly-embed.js")
  );

const mainScript = getScriptTag();
const scriptUrl = mainScript.getAttribute("src");
const backendUrl = mainScript.getAttribute("data-backend");
const postId = mainScript.getAttribute("data-post");
const debug = mainScript.getAttribute("debug") != null;

const log = (str) => {
  if (debug) console.log(str);
};

const ensureConnection = async () => {
  try {
    const result = await fetch(backendUrl);
    return result.ok;
  } catch {
    return false;
  }
};

const getAllComments = async () => {
  const result = await fetch(`${backendUrl}/api/v1/posts/${postId}`);
  return result.ok ? await result.json() : undefined;
}

log(`Loading chtly embed for post "${postId}"...`);

const init = (async () => {
  const chtlyContainers = $("#chtly__container");
  if (chtlyContainers.length <= 0) {
    console.warn("chtly__container node not found!");
    return;
  }
  const chtly = chtlyContainers.first();

  log(`Trying to connect to backend...`);

  if (!(await ensureConnection())) {
    console.error("Connection to chtly backend failed!");
    return;
  }
  log("Successfully connected to chtly backend!");
  log("Loading all comments...")
  const comments = await getAllComments();
  if (!comments) {
    console.error(`Failed to load comments for post ${postId}`)
    return;
  }
  log(`Successfully loaded comments for post ${postId}`);

  log(`Adding custom styles...`);
  const styleUrl = scriptUrl.startsWith("/") ? "/chtly-embed.css" : scriptUrl.replace(/.js/, ".css");
  $(`<link rel="stylesheet" href="${styleUrl}">`).appendTo($("head"));

  $(`<p>${JSON.stringify(comments)}</p>`).appendTo(chtly);

});

$(init);
