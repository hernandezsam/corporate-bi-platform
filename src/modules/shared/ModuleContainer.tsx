"use client";

import { useEffect, useRef, useState } from "react";
import type { CorporateModule } from "@/types/modules";
import { cn } from "@/lib/utils";
import { ModuleHeader } from "@/modules/shared/ModuleHeader";

interface ModuleContainerProps {
  module: CorporateModule;
  onReload?: () => void;
  extraActions?: React.ReactNode;
  /** Cuando true, el contenido interno se estira al 100% del viewport (iframes/PDF). */
  edgeToEdge?: boolean;
  children: (state: { isFullscreen: boolean }) => React.ReactNode;
}

export function ModuleContainer({
  module,
  onReload,
  extraActions,
  edgeToEdge = true,
  children,
}: ModuleContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    function handleFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <ModuleHeader
        module={module}
        isFullscreen={isFullscreen}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails((prev) => !prev)}
        onReload={onReload}
        onToggleFullscreen={toggleFullscreen}
        extraActions={extraActions}
      />

      <div
        ref={containerRef}
        className={cn(
          "relative flex-1 overflow-auto bg-white",
          isFullscreen
            ? "h-screen w-screen rounded-none border-0"
            : "rounded-lg border border-slate-200 shadow-sm",
          !edgeToEdge && !isFullscreen && "min-h-[calc(100vh-6.25rem)]"
        )}
      >
        {children({ isFullscreen })}
      </div>
    </div>
  );
}
