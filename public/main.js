const input = document.getElementById("newMessage");
const ul = document.getElementById("messages");

let userId;
const ws = new WebSocket(`ws://${location.host}`);
ws.addEventListener("open", () => {
  console.log("connected");
});
ws.addEventListener("close", () => {
  console.log("closed");
});
ws.addEventListener("error", (err) => {
  console.log("ws error: ", err.toString());
});

ws.addEventListener("message", async (res) => {
  const data = JSON.parse(res.data);
  if (data.type === "user") {
    userId = data.id;
    const lastMessages = data.lastMessages;
    for (let i = 0; i < lastMessages.length; i++) {
      const message = lastMessages[i];
      await Promise.resolve().then(() =>
        appendMessage(message.id, message.message)
      );
    }
  } else if (data.type === "message") {
    appendMessage(data.id, data.message, false);
  }
});

document.getElementById("send").addEventListener("click", send);

function send() {
  const newMessage = input.value;
  if (newMessage) {
    input.value = "";
    ws.send(
      JSON.stringify({
        type: "message",
        id: userId,
        message: newMessage,
      })
    );
    appendMessage(userId, newMessage, true);
  }
}

function appendMessage(userId, message, self) {
  const li = document.createElement("li");
  li.setAttribute("class", "flex items-start gap-3");
  if (self) {
    li.classList.add("text-right", "flex-row-reverse");
  }
  const name = userId.substring(0, 3);
  const color = userId.substring(0, 6);
  const msgSpan = document.createElement("span");
  msgSpan.setAttribute(
    "class",
    `
		block min-w-[10%] border border-gray-300 rounded text-left p-2 bg-white text-gray-700 break-all shadow
		relative before:block before:absolute before:w-3 before:h-3 before:border before:top-3
		before:left-0 before:translate-x-[-50%] before:border-gray-300 before:rotate-45 before:bg-white
		before:border-r-transparent before:border-t-transparent
		`
  );
  if (self) {
    msgSpan.classList.remove("before:left-0");
    msgSpan.classList.add(
      "before:right-0",
      "before:translate-x-[50%]",
      "before:rotate-[225deg]"
    );
  }
  msgSpan.innerText = message;
  li.innerHTML = `
	<span class="font-medium uppercase py-2 px-2 text-white bg-[#${color}] border rounded">${name}</span>
	`;
  li.appendChild(msgSpan);
  ul.appendChild(li);
  li.scrollIntoView();
}

document.getElementById("newMessage").addEventListener("keydown", (e) => {
  if (e.metaKey && e.key === "Enter") {
    console.log(e);
    send();
  }
});
