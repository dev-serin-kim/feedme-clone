"use client";

import { XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

/** Message the slideshow page posts to its parent when Esc is pressed (see slideshow.tsx). */
export const CLOSE_SLIDES_MESSAGE = "feedme:close-slides";

/** Shows the slideshow over the page instead of a popup window, which browsers may block. */
export function SlideshowOverlay({ html, onClose }: { html: string; onClose: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source === frame.current?.contentWindow && event.data === CLOSE_SLIDES_MESSAGE) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="발표 자료" className="fixed inset-0 z-50 bg-black">
      <iframe
        ref={frame}
        title="발표 자료"
        srcDoc={html}
        allowFullScreen
        onLoad={() => frame.current?.contentWindow?.focus()}
        className="size-full border-0"
      />
      <Button variant="outline" onClick={onClose} className="absolute top-3 right-3">
        <XIcon data-icon="inline-start" />
        닫기 (Esc)
      </Button>
    </div>,
    document.body,
  );
}
