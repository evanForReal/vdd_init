import type { LanguageCode } from "../types";

export function TargetText({
  language,
  text,
  className = "",
}: {
  language: LanguageCode;
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`target-text ${className}`}
      dir={language === "ar" ? "rtl" : undefined}
      lang={language}
    >
      {text}
    </span>
  );
}
