import { useState } from "react";

export default function BrandLogo({ className = "h-11 w-11", alt = "知行智链品牌标识" }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);

  if (imageUnavailable) {
    return (
      <span
        aria-label={alt}
        className={`${className} inline-flex shrink-0 items-center justify-center rounded-2xl border border-cyan/40 bg-gradient-to-br from-cyan/35 via-[#147fa1]/45 to-mint/25 shadow-glow`}
      >
        <span className="h-3 w-3 rounded-full bg-mint shadow-[0_0_14px_rgba(94,234,212,.8)]" />
      </span>
    );
  }

  return (
    <img
      src="/assets/brand-logo.png"
      alt={alt}
      onError={() => setImageUnavailable(true)}
      className={`${className} shrink-0 rounded-2xl border border-cyan/55 p-0.5 object-cover object-center shadow-[0_0_0_3px_rgba(34,211,238,.1),0_0_22px_rgba(34,211,238,.35)]`}
    />
  );
}
