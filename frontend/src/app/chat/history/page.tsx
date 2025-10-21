import ChatHistoryDisplay from '@/app/components/sidebar-ui/ChatHistoryPage';

export default function ChatHistoryPage() {
  return (
    <div className="p-4 h-full"> {/* Add padding and full height */}
      <ChatHistoryDisplay />
    </div>
  );
}