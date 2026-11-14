import type { Metadata } from "next";

import { PolicyContact } from "@/components/shop/policy/PolicyContact";
import { PolicyList, PolicyPage, PolicySection, PolicyText } from "@/components/shop/policy/PolicyPage";

export const metadata: Metadata = {
  title: "রিটার্ন নীতি",
  description: "নষ্ট, ভুল বা ত্রুটিপূর্ণ পণ্য পেলে ডেলিভারির 3 দিনের মধ্যে জানান, আমরা বদলে দেব বা টাকা ফেরত দেব।",
};

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      title="রিটার্ন নীতি"
      intro="আপনি যেন সঠিক ও ভালো পণ্য পান, সেটাই আমাদের লক্ষ্য। কোনো সমস্যা হলে নিচের নিয়মে আমাদের জানান।"
    >
      <PolicySection title="কখন রিটার্ন করা যাবে">
        <PolicyList
          items={[
            "পণ্য নষ্ট বা ভাঙা অবস্থায় পেলে",
            "অর্ডার করা পণ্যের বদলে ভুল পণ্য পেলে",
            "পণ্য ঠিকমতো কাজ না করলে (ত্রুটিপূর্ণ হলে)",
          ]}
        />
      </PolicySection>

      <PolicySection title="কীভাবে জানাবেন">
        <PolicyList
          items={[
            "ডেলিভারি পাওয়ার 3 দিনের মধ্যে আমাদের জানাতে হবে।",
            "সমস্যাটা পরিষ্কার দেখা যায় এমন ছবি বা ভিডিও পাঠাতে হবে।",
            "সাথে আপনার অর্ডার নম্বর (যেমন KE10001) বা যে মোবাইল নম্বরে অর্ডার করেছেন, সেটা দিন।",
          ]}
        />
        <PolicyContact />
      </PolicySection>

      <PolicySection title="আমরা যা করব">
        <PolicyList
          items={[
            "যাচাই করে 7 দিনের মধ্যে পণ্য বদলে দেব, অথবা বিকাশ বা নগদে টাকা ফেরত দেব।",
            "পণ্য ফেরত পাঠানোর কুরিয়ার খরচ আমরা দেব।",
          ]}
        />
      </PolicySection>

      <PolicySection title="যেসব ক্ষেত্রে রিটার্ন হবে না">
        <PolicyList
          items={[
            "পণ্য ভালো আছে, কিন্তু পছন্দ বদলে গেছে বা আর দরকার নেই।",
            "ডেলিভারির 3 দিন পার হয়ে যাওয়ার পর জানালে।",
            "ছবি বা ভিডিও ছাড়া জানালে।",
          ]}
        />
        <PolicyText>
          ক্যাশ অন ডেলিভারি পার্সেল দরজায় নিতে অস্বীকার করলে সেটা রিটার্ন হিসেবে ধরা হয় না। পার্সেল হাতে নিয়ে সমস্যা
          পেলে উপরের নিয়মে জানান।
        </PolicyText>
      </PolicySection>
    </PolicyPage>
  );
}
