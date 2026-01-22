import type { ComponentProps } from "react";
import Link from "next/link";

export function Header({ className = "", ...props }: ComponentProps<"header">) {
  return (
    <header
      className={`sticky top-0 z-10 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md ${className}`}
      {...props}
    >
      <nav>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://cdn.prod.website-files.com/663baa8f9f96b4cfa4869412/665358696dee1ef2344f3701_logo.svg"
              alt="Streaver"
              className="h-6 brightness-0 invert"
            />
            <span className="text-lg font-semibold tracking-tight text-white">
              Newsletter
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/posts"
              className="text-sm font-medium text-[#9CA3AF] transition-colors hover:text-white"
            >
              Posts
            </Link>
            <Link
              href="#"
              className="rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              Let&apos;s Talk
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
