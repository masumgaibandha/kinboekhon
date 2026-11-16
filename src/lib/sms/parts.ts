// GSM 7-bit basic set; any other character (Bangla too) makes the whole SMS Unicode.
const GSM_BASIC = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/;
// These take two places in a GSM SMS.
const GSM_EXTENDED = /[\^{}\\[~\]|€]/g;

export interface SmsSize {
  chars: number;
  parts: number;
  unicode: boolean;
}

// Unicode: 70 characters in one part, 67 per part when longer. GSM: 160, then 153 per part.
export function smsSize(text: string): SmsSize {
  const unicode = !GSM_BASIC.test(text);
  const chars = unicode ? text.length : text.length + (text.match(GSM_EXTENDED)?.length ?? 0);
  const [single, multi] = unicode ? [70, 67] : [160, 153];
  const parts = chars === 0 ? 0 : chars <= single ? 1 : Math.ceil(chars / multi);
  return { chars, parts, unicode };
}
