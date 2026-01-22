import type { ComponentProps } from "react";

export function Footer({ className = "", ...props }: ComponentProps<"footer">) {
  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-10 ${className}`}
      {...props}
    >
      <div className="border-t border-white/5 bg-[#050505]/80 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <img
                src="https://cdn.prod.website-files.com/663baa8f9f96b4cfa4869412/665358696dee1ef2344f3701_logo.svg"
                alt="Streaver"
                className="h-4 brightness-0 invert"
              />
              <span className="text-sm text-[#9CA3AF]">
                — Building exceptional software
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-[#9CA3AF] transition-colors hover:text-[#2563EB]"
              >
                Services
              </a>
              <a
                href="#"
                className="text-[#9CA3AF] transition-colors hover:text-[#2563EB]"
              >
                About
              </a>
              <a
                href="#"
                className="text-[#9CA3AF] transition-colors hover:text-[#2563EB]"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-[#F97316] transition-colors hover:text-[#FF6F00]"
              >
                Learn More
              </a>
            </div>

            <p className="text-xs text-[#9CA3AF]/60">
              &copy; {new Date().getFullYear()} Streaver
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
