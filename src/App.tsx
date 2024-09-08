import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";

// For demo purposes. In a real app, you'd have real user data.
const NAME = faker.person.firstName();

export default function App() {
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);
  const likeMessage = useMutation(api.messages.like);

  const [newMessageText, setNewMessageText] = useState("");

  useEffect(() => {
    // Make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [messages]);

  return (
    <main className="chat p-1" data-theme="cupacke">
      <header className="card bg-slate-600/75 absolute p-3">
        <h1 >
        <p>
          Connected as <strong>{NAME}</strong>
        </p>
        </h1>
      </header>
      <div className="min-w-full bg-slate-300" >
      {messages?.map((message) => (
        <article data-theme="cupcake"
          key={message._id}
          
          className={"rounded-full  glass opacity-15" +message.author === NAME ? "message-mine" : ""}
        >
          <div className="bg-slate-300/25 p-1 w-fit rounded">{message.author}</div>

          <p className="bg-current/60 shadow-sm">{message.body}
            <button  onClick={async () => await likeMessage({ liker: NAME, messageId: message._id })}>
              
              {/* if the messsage.like is not zero, display the likes number */}
              {message.likes > 0 && <span>{message.likes}</span>} 🤍
            </button>

          </p>

        </article>
      ))}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await sendMessage({ body: newMessageText, author: NAME });
          setNewMessageText("");
        }}
      >
        <input
          value={newMessageText}
          onChange={async (e) => {
            const text = e.target.value;
            setNewMessageText(text);
          }}
          placeholder="Write a message…"
        />
        <button  type="submit" disabled={!newMessageText}>
          Send
        </button>
      </form>
    </main>
  );
}
