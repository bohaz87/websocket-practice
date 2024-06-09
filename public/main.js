const input = document.getElementById("newMessage");
const ul = document.getElementById("messages");

let userId;
const ws = new WebSocket("ws://localhost:3000");
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
  li.setAttribute("class", "flex items-start gap-2");
  if (self) {
    li.classList.add("text-right", "flex-row-reverse");
  }
  const displayId = userId.substring(0, 6);
  li.innerHTML = `<span class="font-medium uppercase py-2 px-2 text-white bg-[#${displayId}]">${displayId}</span><span class="block min-w-[10%] border border-gray-300 rounded text-left p-2 bg-white break-all	shadow">${message.replace(
    /\n/,
    "<br/>"
  )}</span>`;
  ul.appendChild(li);
  li.scrollIntoView();
}

document.getElementById("newMessage").addEventListener("keydown", (e) => {
  if (e.metaKey && e.key === "Enter") {
    console.log(e);
    send();
  }
});
