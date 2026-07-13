"use client";

import { Menu, X } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

export function MobileNavbar({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [top, setTop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const open = () => {
    const header = buttonRef.current?.closest("header");
    setTop(header ? header.getBoundingClientRect().bottom : 0);
    setIsOpen(true);
  };

  useEffect(() => {
    document.documentElement.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const close = () => setIsOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("orientationchange", close);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("orientationchange", close);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="md:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 animate-in fade-in md:hidden"
          style={{ top }}
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="animate-in slide-in-from-top-2"
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}
