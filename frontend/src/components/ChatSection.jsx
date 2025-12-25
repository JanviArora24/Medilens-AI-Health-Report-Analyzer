import { useState } from "react";
import api from "../services/api"; 


const SUGGESTED_QUESTIONS = [
  "Why are some values abnormal?",
  "What lifestyle changes should I follow?",
  "Is this report serious?",
  "Can diet improve my condition?",
];

export default function ChatSection({ reportId }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi 👋 I’ve analyzed your report. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text) {
    if (!text.trim()) return;

    if (!reportId) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Please analyze a report first." },
      ]);
      return;
    }

    const updated = [...messages, { role: "user", text }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/analyze/chat", {
        report_id: reportId,
        question: text,
      });

      setMessages([
        ...updated,
        { role: "ai", text: res.data.reply || "No response received." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...updated,
        { role: "ai", text: "⚠️ Something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 sm:mt-10 bg-white dark:bg-slate-800 rounded-xl shadow flex flex-col h-[75vh] sm:h-[600px]">
      {/* HEADER */}
      <div className="p-3 border-b dark:border-slate-700 font-semibold">
        💬 Chat with AI
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-lg text-sm
              ${
                m.role === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 dark:text-white"
              }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs opacity-60">AI typing...</div>}
      </div>

      {/* QUICK QUESTIONS */}
      <div className="p-2 flex flex-wrap gap-2 border-t dark:border-slate-700">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            className="text-xs px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 hover:opacity-80"
          >
            {q}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-2 flex gap-2 border-t dark:border-slate-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your report..."
          className="flex-1 px-3 py-2 text-sm rounded bg-slate-100 dark:bg-slate-700 outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
        />
        <button
          onClick={() => sendMessage(input)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
