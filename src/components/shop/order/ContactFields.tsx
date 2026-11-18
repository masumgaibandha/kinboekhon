import { StepField, inputClass, textareaClass } from "@/components/shop/order/StepField";

const invalid = (errors: Record<string, string>, field: string) =>
  errors[field] ? { "aria-invalid": true, "aria-describedby": `order-${field}-error` } : {};

// The input shows a fixed +880, so a number typed without the leading 0 gets it back.
export function withCountryCode(raw: string): string {
  const typed = raw.trim();
  return /^[1১]/.test(typed) ? `+880${typed}` : typed;
}

// The typed part of the address: house, road, area.
export function AddressField({ errors }: { errors: Record<string, string> }) {
  return (
    <StepField id="order-address" label="ঠিকানা (বাড়ি, রাস্তা, এলাকা)" error={errors.address}>
      <textarea
        id="order-address"
        name="address"
        rows={2}
        autoComplete="street-address"
        placeholder="যেমন: বাড়ি নম্বর, রাস্তা, এলাকার নাম"
        className={textareaClass}
        {...invalid(errors, "address")}
      />
    </StepField>
  );
}

// The customer's name and mobile number.
export function ContactFields({ errors }: { errors: Record<string, string> }) {
  return (
    <>
      <StepField id="order-name" label="আপনার নাম" error={errors.name}>
        <input
          id="order-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="নাম লিখুন"
          className={inputClass}
          {...invalid(errors, "name")}
        />
      </StepField>
      <StepField id="order-phone" label="মোবাইল নম্বর" error={errors.phone}>
        <div className="flex h-12 overflow-hidden rounded-xl border border-line-strong bg-card transition-shadow focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/25 has-aria-invalid:border-brand-dark">
          <span aria-hidden="true" className="flex items-center border-r border-line bg-page px-3 text-base font-semibold text-desc">
            +880
          </span>
          <input
            id="order-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="1XXXXXXXXX"
            className="h-full min-w-0 flex-1 bg-card px-3 text-base text-body outline-none placeholder:text-muted"
            {...invalid(errors, "phone")}
          />
        </div>
      </StepField>
    </>
  );
}
