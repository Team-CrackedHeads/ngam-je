// fix the grid layout for different screen sizes
// New file
import React from "react";
import ThreadCard from "./ThreadCard";
import { ThreadData } from "@/utils/mock-threads-data";

type ThreadsGridProps = {
  threads: ThreadData[];
};

export default function ThreadsGrid({ threads }: ThreadsGridProps) {
  return (
    <div
      className="
        grid gap-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
        items-stretch
      "
    >
      {threads.map((thread, idx) => (
        <ThreadCard key={idx} thread={thread} />
      ))}
    </div>
  );
}
