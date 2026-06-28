import Image from "next/image";
import { initials } from "@portal/lib/format";

export function Avatar({
  src,
  name,
  size = 40,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover border border-sea-fog"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center bg-ice-tint text-signal-blue font-bold shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
