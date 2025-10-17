import ChatHistoryDisplay from '@/app/components/sidebar-ui/ChatHistoryPage';

type ChatDetailPageProps = {
  params: {
    chatId: string;
  };
};

export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  const chatId = parseInt(params.chatId, 10);
  return (
    <div className="p-4 h-full"> {/* Add padding and full height */}
      <ChatHistoryDisplay initialChatId={chatId} />
    </div>
  );
}