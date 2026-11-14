import type { Metadata } from "next";

import { PolicyContact } from "@/components/shop/policy/PolicyContact";
import { PolicyList, PolicyPage, PolicySection, PolicyText } from "@/components/shop/policy/PolicyPage";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি",
  description: "আপনার নাম, ফোন ও ঠিকানা আমরা শুধু অর্ডার ডেলিভারির জন্য নিই এবং কখনো বিক্রি করি না।",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="প্রাইভেসি পলিসি"
      intro="আপনার তথ্য আমাদের কাছে আমানত। কোন তথ্য নিই, কেন নিই আর কীভাবে রাখি, সহজ ভাষায় নিচে লেখা হলো।"
    >
      <PolicySection title="আমরা যে তথ্য নিই">
        <PolicyList
          items={[
            "আপনার নাম",
            "মোবাইল নম্বর",
            "ডেলিভারির ঠিকানা (বিভাগ, জেলা, উপজেলা বা থানা এবং বাড়ি ও রাস্তা)",
            "অগ্রিম পেমেন্ট করলে: যে নম্বর বা অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন এবং ট্রানজেকশন আইডি",
          ]}
        />
      </PolicySection>

      <PolicySection title="কেন নিই">
        <PolicyText>
          শুধু আপনার অর্ডার কনফার্ম করা আর পণ্য আপনার কাছে পৌঁছে দেওয়ার জন্য। এজন্য ফোন করে অর্ডার কনফার্ম করি এবং
          পার্সেল পাঠাতে কুরিয়ারকে আপনার নাম, ফোন ও ঠিকানা দিই।
        </PolicyText>
        <PolicyText>
          অর্ডার ফর্ম পূরণ করে শেষ না করলে, লেখা তথ্য আমরা কিছুদিন রেখে দিতে পারি এবং অর্ডার করতে সাহায্য করতে ফোন
          করতে পারি।
        </PolicyText>
        <PolicyText>
          ভুয়া অর্ডার ঠেকাতে আপনার ডিভাইসের কিছু কারিগরি তথ্য (যেমন IP ঠিকানা ও ব্রাউজারের ধরন) রাখা হয়।
        </PolicyText>
      </PolicySection>

      <PolicySection title="আমরা কখনো যা করি না">
        <PolicyList
          items={[
            "আপনার তথ্য কারো কাছে বিক্রি করি না।",
            "ডেলিভারির প্রয়োজন ছাড়া অন্য কাউকে দিই না।",
          ]}
        />
      </PolicySection>

      <PolicySection title="ফেসবুক বিজ্ঞাপন (Meta Pixel)">
        <PolicyText>
          আমরা ফেসবুক ও ইনস্টাগ্রামে বিজ্ঞাপন দিই। কোন বিজ্ঞাপন কাজ করছে বুঝতে আমাদের সাইটে Meta Pixel ব্যবহার করা হয়।
          এটি কুকির মাধ্যমে জানায় আপনি কোন পণ্য দেখেছেন বা অর্ডার করেছেন, যাতে Meta আপনাকে প্রাসঙ্গিক বিজ্ঞাপন
          দেখাতে পারে। আপনার ফেসবুক অ্যাকাউন্টের বিজ্ঞাপন সেটিংস থেকে এটি নিয়ন্ত্রণ করতে পারেন।
        </PolicyText>
      </PolicySection>

      <PolicySection title="প্রশ্ন বা তথ্য মুছতে চাইলে">
        <PolicyText>আপনার তথ্য দেখতে বা মুছে ফেলতে চাইলে আমাদের জানান।</PolicyText>
        <PolicyContact />
      </PolicySection>
    </PolicyPage>
  );
}
