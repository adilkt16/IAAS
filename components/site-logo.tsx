import Image from "next/image";

interface SiteLogoProps {
  size?: number;
  showText?: boolean;
  textSizeClassName?: string;
  className?: string;
}

export default function SiteLogo({
  size = 40,
  showText = true,
  textSizeClassName = "text-4xl",
  className = "",
}: SiteLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo-instagram-export.svg"
        alt="Instagram Export Viewer logo"
        width={size}
        height={size}
        priority
      />
      {showText ? (
        <span
          className={`bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text font-bold text-transparent ${textSizeClassName}`}
        >
          Instagram Export Viewer
        </span>
      ) : null}
    </div>
  );
}
