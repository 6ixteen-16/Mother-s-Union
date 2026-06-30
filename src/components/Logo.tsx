import Image from "next/image";

interface LogoProps {
  className?: string;
   /** "full" shows the horizontal Mothers' Union branded logo.
   *  "crest" shows just the MU monogram mark. 
   *  "logo-only" shows the horizontal logo without the crest. Default: "full" */
  variant?: "full" | "crest" | "logo-only";
}

export default function Logo({ className = "", variant = "full" }: LogoProps) {
  if (variant === "crest") {
    return (
      <Image
        src="/mu-crest.png"
        alt="Mothers Union monogram"
        width={40}
        height={40}
        className={`shrink-0 ${className}`}
        priority
      />
    );
  }

  if (variant === "logo-only") {
    return (
      <Image
        src="/mu-logo.png"
        alt="Mothers' Union — Christian care for families"
        width={400}
        height={120}
        className={`shrink-0 object-contain ${className}`}
        priority
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* MU crest mark */}
      <Image
        src="/mu-crest.png"
        alt=""
        aria-hidden="true"
        width={36}
        height={36}
        className="shrink-0"
        priority
      />
      {/* Full horizontal logo */}
      <Image
        src="/mu-logo.png"
        alt="Mothers' Union — Christian care for families"
        width={160}
        height={48}
        className="h-9 w-auto object-contain"
        priority
      />
    </div>
  );
}
