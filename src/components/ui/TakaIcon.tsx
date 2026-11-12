interface TakaIconProps {
  strokeWidth: number;
}

// The taka stroke from Heroicons "currency-bangladeshi" (MIT License, Copyright (c) Tailwind Labs, Inc.), without the circle.
const TAKA_PATH =
  "m8.25 7.5l.415-.207a.75.75 0 0 1 1.085.67V10.5m0 0h6m-6 0h-1.5m1.5 0v5.438c0 .354.161.697.473.865a3.75 3.75 0 0 0 5.452-2.553c.083-.409-.263-.75-.68-.75h-.745";

// Measured outline of the path, without stroke.
const BOX = { x: 8.25, y: 7.214, width: 7.5, height: 10.037 };

// Same height as the digits of the system font, measured at 0.71em.
const DIGIT_HEIGHT_EM = 0.71;

export function TakaIcon({ strokeWidth }: TakaIconProps) {
  const half = strokeWidth / 2;
  const width = BOX.width + strokeWidth;
  const height = BOX.height + strokeWidth;

  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${BOX.x - half} ${BOX.y - half} ${width} ${height}`}
      fill="none"
      stroke="currentColor"
      className="inline-block align-baseline"
      style={{ height: `${DIGIT_HEIGHT_EM}em`, width: `${(DIGIT_HEIGHT_EM * width) / height}em` }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d={TAKA_PATH} />
    </svg>
  );
}
