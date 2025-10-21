import ChatHistoryDisplay from '@/components/sidebar/ChatHistoryPage';

type ChatDetailPageProps = {
  params: {
    chatid: string; // Keep this type, as it's the expected final value
  };
};

// 1. Make the component an async function
export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  const chatid = Number(params.chatid);

  return (
    <div className="p-4 h-full"> {/* Add padding and full height */}
      <ChatHistoryDisplay initialChatId={chatid} />
    </div>
  );
}
