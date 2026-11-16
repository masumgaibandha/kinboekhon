import { smsSize } from "@/lib/sms/parts";

interface SmsCountProps {
  text: string;
  prefix?: string;
}

// Characters and SMS parts, so the admin can keep each SMS short and cheap.
export function SmsCount({ text, prefix }: SmsCountProps) {
  const { chars, parts, unicode } = smsSize(text);
  const rule = unicode ? "Bangla / Unicode: 70 per part, 67 when longer" : "English only: 160 per part, 153 when longer";
  return (
    <p className="mt-1 text-sm text-muted">
      {prefix}
      <span className={parts > 1 ? "font-semibold text-brand-dark" : "font-semibold text-body"}>
        {chars} characters, {parts} SMS {parts === 1 ? "part" : "parts"}
      </span>{" "}
      ({rule})
    </p>
  );
}
