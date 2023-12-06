import $ from "./module/cash.js";
import moment from './module/moment.js';

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
};

log(`Loading chtly embed for post "${postId}"...`);

const addComment = (container, comment, prepend = false) => {
  const commentNode = $(`<div class="chtly__comment" />`);
  const commentNodeTop = $(`<div class="top" />`);
  $(`<div class="avatar"><img src="./anon.webp" height="30" width="30"></img>${comment.user}</div>`).appendTo(commentNodeTop);
  $(`<p class="timedate" title="${moment(comment.date).format()}">${moment(comment.date).fromNow()}</p>`).appendTo(commentNodeTop);
  commentNodeTop.appendTo(commentNode);
  $(`<div class="comment">${comment.comment}</p>`).appendTo(commentNode);
  if (prepend) commentNode.prependTo(container);
  else commentNode.appendTo(container);
};

const loadAndRenderComments = async (commentsContainer) => {
  commentsContainer.empty();
  log("Loading all comments...");
  let comments = await getAllComments();
  if (!comments) {
    console.error(`Failed to load comments for post ${postId}`);
    return;
  }

  log(`Successfully loaded comments for post ${postId}`);

  Array.from(comments.comments).forEach((comment) => addComment(commentsContainer, comment));
}

const init = async () => {
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



  log(`Adding custom styles...`);
  const styleUrl = scriptUrl.startsWith("/")
    ? "/chtly-embed.css"
    : scriptUrl.replace(/.js/, ".css");
  $(`<link rel="stylesheet" href="${styleUrl}">`).appendTo($("head"));

  const commentContainer = $(`<div class="chtly__commentContainer" />`);
  const textArea = $(`<textarea></textarea>`);
  const toolbar = $(`<div class="chtly__toolbar" />`);
  const charCounter = $(`<span class="chtly__charCounter">0/2000</span>`);
  const postButton = $(`<p class="chtly__postButton">Post</p>`);
  textArea[0].addEventListener("input", () => {
    if (textArea.val().length > 2000) charCounter.addClass("warn");
    else charCounter.removeClass("warn");
    charCounter.text(`${textArea.val().length}/2000`);
  });

  textArea.appendTo(commentContainer);

  postButton.appendTo(toolbar);
  charCounter.appendTo(toolbar);
  toolbar.appendTo(commentContainer);

  commentContainer.appendTo(chtly);

  $(`<div class="chtly__hr" />`).appendTo(chtly);

  const commentsContainer = $(`<div class="chtly__commentsContainer" />`);
  commentsContainer.appendTo(chtly);
  loadAndRenderComments(commentsContainer);

  postButton[0].addEventListener("click", async () => {
    const textLength = textArea.val().length;
    if (textLength <= 0)
      return;

    if (textLength > 2000) {
      alert("Your comment has too many characters.");
      return;
    }

    const newComment = await fetch(`${backendUrl}/api/v1/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify({
        comment: textArea.val(),
        user: "Anonymous",
        post: postId
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (newComment.ok) {
      const callback = await newComment.json();
      if (!("success" in callback) || !callback.success) {
        alert("There was an error while processing your comment.");
        console.error(callback);
      } else {
        textArea.val("");
        addComment(commentsContainer, callback.comment, true);
      }
    }
  });
};

$(init);
