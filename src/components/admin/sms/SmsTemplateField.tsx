"use client";

import { useState } from "react";

import { inputClass } from "@/components/admin/form/fields";
import { SmsCount } from "@/components/admin/sms/SmsCount";
import { SMS_TEMPLATE_HINTS, SMS_TEMPLATE_LABELS, renderSms, sampleSmsValues, type AutoTemplate } from "@/lib/sms/templates";
import { SMS_MAX_CHARS } from "@/lib/validation/sms-settings";

interface SmsTemplateFieldProps {
  template: AutoTemplate;
  enabled: boolean;
  text: string;
  error?: string;
}

export function SmsTemplateField({ template, enabled, text, error }: SmsTemplateFieldProps) {
  const [value, setValue] = useState(text);
  const id = `sms-${template}`;

  return (
    <div className="space-y-1 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-heading">
          {SMS_TEMPLATE_LABELS[template]}
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-body">
          <input name={`templates.${template}.enabled`} type="checkbox" defaultChecked={enabled} className="h-4 w-4 accent-brand" />
          On
        </label>
      </div>
      <p className="text-sm text-desc">{SMS_TEMPLATE_HINTS[template]}</p>
      <textarea
        id={id}
        name={`templates.${template}.text`}
        rows={3}
        maxLength={SMS_MAX_CHARS}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={`${inputClass} ${error ? "border-brand-dark" : "border-line-strong"}`}
      />
      {error && <p className="text-sm text-brand-dark">{error}</p>}
      <SmsCount text={renderSms(value.trim(), sampleSmsValues(template))} prefix="With sample values: " />
    </div>
  );
}
