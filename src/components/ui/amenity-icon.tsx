import type { SVGProps } from "react";
import type { AmenityKey } from "@/lib/home-amenities";

type AmenityIconProps = SVGProps<SVGSVGElement> & {
  amenity: AmenityKey;
};

const shared = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function AmenityIcon({ amenity, ...props }: AmenityIconProps) {
  const art = {
    wifi: (
      <>
        <path d="M4 9.5a12.2 12.2 0 0 1 16 0M7 13a7.5 7.5 0 0 1 10 0M10.2 16.5a2.8 2.8 0 0 1 3.6 0" />
        <circle cx="12" cy="19" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    washing_machine: (
      <>
        <rect x="4.5" y="3" width="15" height="18" rx="2.2" />
        <path d="M4.5 8h15M8 5.5h.01M11 5.5h.01" />
        <circle cx="12" cy="14.5" r="4.2" />
        <path d="M9.4 14.6c1.4-1.5 3.2-1.4 5.2.1" />
      </>
    ),
    dryer: (
      <>
        <rect x="4.5" y="3" width="15" height="18" rx="2.2" />
        <path d="M4.5 8h15M8 5.5h.01M11 5.5h.01" />
        <circle cx="12" cy="14.5" r="4.2" />
        <path d="M10 15.8c1.3-2.7 3.7-2.4 4.4-.4M10.2 12.7c1-.8 2.2-.8 3.4-.2" />
      </>
    ),
    dishwasher: (
      <>
        <rect x="4.5" y="3" width="15" height="18" rx="2.2" />
        <path d="M4.5 8h15M8 5.5h.01M11 5.5h.01M8 17.5h8" />
        <path d="M8.5 14.8c.7-2.2 2-3.3 3.5-3.3s2.8 1.1 3.5 3.3" />
        <path d="M12 10v1.5" />
      </>
    ),
    heater: (
      <>
        <path d="M7.5 5.5c-1-1-.9-2.1.1-3M12 5.5c-1-1-.9-2.1.1-3M16.5 5.5c-1-1-.9-2.1.1-3" />
        <rect x="4" y="8" width="16" height="11" rx="2" />
        <path d="M8 8v11M12 8v11M16 8v11M6.5 21v-2M17.5 21v-2" />
      </>
    ),
    ac: (
      <>
        <rect x="3" y="4" width="18" height="9" rx="2.5" />
        <path d="M6 8.5h12M7 16c1.2-1.2 2.4-1.2 3.6 0s2.4 1.2 3.6 0M9 20c1-1 2-1 3 0s2 1 3 0" />
        <path d="M6.5 13v-1M17.5 13v-1" />
      </>
    ),
    parking: (
      <>
        <rect x="4" y="2.5" width="16" height="19" rx="3" />
        <path d="M9 17V7h3.5a3.3 3.3 0 0 1 0 6.6H9M9 13.6h3.5" />
      </>
    ),
    elevator: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M12 3v18M7 8l2-2 2 2M17 6l-2 2-2-2" />
        <circle cx="8" cy="12" r="1.2" />
        <path d="M6.3 17.5v-2.3c0-1 .8-1.8 1.7-1.8s1.7.8 1.7 1.8v2.3" />
        <circle cx="16" cy="12" r="1.2" />
        <path d="M14.3 17.5v-2.3c0-1 .8-1.8 1.7-1.8s1.7.8 1.7 1.8v2.3" />
      </>
    ),
  }[amenity];

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...shared} {...props}>
      {art}
    </svg>
  );
}
