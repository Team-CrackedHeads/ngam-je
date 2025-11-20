export const getRelativeTime = (dateString: string | undefined): string => {
  if (!dateString) return "recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;

  return date.toLocaleDateString();
};

export const getRoleBadge = (role: "seller" | "buyer" | "helper" | null | undefined): { text: string; color: string } | null => {
  switch (role) {
    case "seller":
      return { text: "Seller", color: "bg-blue-500/10 text-blue-700 border-blue-200" };
    case "helper":
      return { text: "Helper", color: "bg-green-500/10 text-green-700 border-green-200" };
    case "buyer":
      return { text: "Buyer", color: "bg-purple-500/10 text-purple-700 border-purple-200" };
    default:
      return null;
  }
};

export const formatCount = (count: number | undefined): string => {
  if (!count || count === 0) return "0";
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}m`;
};
