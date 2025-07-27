// ChatBubble.tsx
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`my-2 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-250 p-3 rounded-lg ${
          isUser ? "bg-blue-500 text-white" : "bg-white text-gray-900"
        }`}
        style={{ whiteSpace: 'pre-wrap' }} // <-- preserve \n newlines
      >
        {message.content}
      </div>
    </div>
  );
}
