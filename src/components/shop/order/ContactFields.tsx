import { OrderField, fieldClass } from "@/components/shop/order/OrderField";

const invalid = (errors: Record<string, string>, field: string) =>
  errors[field] ? { "aria-invalid": true, "aria-describedby": `order-${field}-error` } : {};

// The typed part of the address: house, road, area.
export function AddressField({ errors }: { errors: Record<string, string> }) {
  return (
    <OrderField id="order-address" label="ঠিকানা (বাড়ি, রাস্তা, এলাকা)" error={errors.address}>
      <textarea
        id="order-address"
        name="address"
        rows={2}
        autoComplete="street-address"
        placeholder="যেমন: বাড়ি নম্বর, রাস্তা, এলাকার নাম"
        className={`${fieldClass} resize-none`}
        {...invalid(errors, "address")}
      />
    </OrderField>
  );
}

// The customer's name and mobile number.
export function ContactFields({ errors }: { errors: Record<string, string> }) {
  return (
    <>
      <OrderField id="order-name" label="আপনার নাম" error={errors.name}>
        <input
          id="order-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="নাম লিখুন"
          className={fieldClass}
          {...invalid(errors, "name")}
        />
      </OrderField>
      <OrderField id="order-phone" label="মোবাইল নম্বর" error={errors.phone}>
        <input
          id="order-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          className={fieldClass}
          {...invalid(errors, "phone")}
        />
      </OrderField>
    </>
  );
}
