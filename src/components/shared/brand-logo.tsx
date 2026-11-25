import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = "dark",
  showTagline = false,
  className,
}: BrandLogoProps) {
  const isLight = variant === "light";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm",
          isLight
            ? "border-white/15 bg-white/10 text-white"
            : "border-slate-800 bg-slate-900 text-white"
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 18V6L9.5 13L15 6V18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 6V18"
            stroke="#60A5FA"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            "text-sm font-semibold tracking-tight",
            isLight ? "text-white" : "text-slate-900"
          )}
        >
          {siteConfig.companyName}
        </span>
        {showTagline && (
          <span
            className={cn(
              "text-[11px]",
              isLight ? "text-slate-400" : "text-slate-500"
            )}
          >
            {siteConfig.tagline}
          </span>
        )}
      </div>
    </div>
  );
}
