"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="bg-gray-100 shadow-md">
      <nav className="flex justify-between items-center p-4 max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-blue-600">Ngam.je</h1>
        <ul className="flex space-x-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={
                  pathname === href
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
