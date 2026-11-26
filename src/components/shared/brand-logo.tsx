import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** "light" = para fondos oscuros (#0D1B2A); "dark" = para fondos claros (blanco/gris) */
  variant?: "light" | "dark";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandLogo({
  variant = "dark",
  showTagline = false,
  size = "md",
  className,
}: BrandLogoProps) {
  const isLightOnDark = variant === "light";
  const src = isLightOnDark
    ? "/brand/logo-dark-bg.png"
    : "/brand/logo-light-bg.png";

  const heightClass =
    size === "sm" ? "h-6" : size === "lg" ? "h-9" : "h-7";

  return (
    <div className={cn("inline-flex flex-col items-start", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={siteConfig.companyName}
        className={cn("w-auto select-none object-contain", heightClass)}
      />
      {showTagline && (
        <span
          className={cn(
            "mt-1 text-[11px] font-medium tracking-tight",
            isLightOnDark ? "text-slate-400" : "text-slate-500"
          )}
        >
          {siteConfig.tagline}
        </span>
      )}
    </div>
  );
}
