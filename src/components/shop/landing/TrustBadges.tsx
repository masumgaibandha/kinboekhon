import { getSettings } from "@/lib/settings";

// Icons in the order of the three trust texts in Settings.
const ICONS = [
  <>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
  </>,
  <>
    <path d="M3 7h11v9H3z" />
    <path d="M14 10h4l3 3v3h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </>,
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
];

export async function TrustBadges() {
  const { trustBadges } = await getSettings();

  return (
    <ul className="grid grid-cols-3 gap-2">
      {trustBadges.map((label, index) => (
        <li
          key={index}
          className="flex flex-col items-center gap-1.5 rounded-md border border-line bg-page px-1.5 py-3 text-center text-[13px] leading-snug text-body"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[22px] w-[22px] text-brand"
          >
            {ICONS[index]}
          </svg>
          {label}
        </li>
      ))}
    </ul>
  );
}
