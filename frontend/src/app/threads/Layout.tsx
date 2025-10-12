import BreadcrumbNav from "./BreadcrumbNav";

export default function ThreadsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <BreadcrumbNav />
      <div className="mt-4">{children}</div>
    </div>
  );
}
