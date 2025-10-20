import ChatHistoryDisplay from '@/app/components/sidebar-ui/ChatHistoryPage';

type ChatDetailPageProps = {
  params: {
    chatid: string; // Keep this type, as it's the expected final value
  };
};

// 1. Make the component an async function
export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  // 2. Await the specific parameter before using it.
  // This is the direct fix suggested by the Next.js error message and documentation.
  // TypeScript might give a warning here because `params.chatid` is typed as `string`,
  // but at runtime, Next.js expects this `await` for dynamic APIs in async components.
  // If TypeScript complains, you can use `const chatidString = await (params.chatid as Promise<string> | string);`
  // or simply `const chatidString = await Promise.resolve(params.chatid);` to satisfy it,
  // but often, just `await params.chatid` works fine at runtime with Next.js's internal handling.
  const chatidString = await params.chatid;

  // Now parse the awaited string to a number, as you intended
  const chatid = parseInt(chatidString, 10);

  return (
    <div className="p-4 h-full"> {/* Add padding and full height */}
      <ChatHistoryDisplay initialChatId={chatid} />
    </div>
  );
}