import type { Metadata } from "next";
import Link from "next/link";

import { PolicyContact } from "@/components/shop/policy/PolicyContact";
import { PolicyList, PolicyPage, PolicySection, PolicyText } from "@/components/shop/policy/PolicyPage";
import { pageMetadata } from "@/lib/seo/page-metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "শর্তাবলী", description: "কিনবো এখন থেকে অর্ডার, দাম, পেমেন্ট ও ডেলিভারির সহজ নিয়ম।", path: "/terms" });
}

export default function TermsPage() {
  return (
    <PolicyPage
      title="শর্তাবলী"
      intro="kinboekhon.com থেকে অর্ডার করলে আপনি নিচের নিয়মগুলো মেনে নিচ্ছেন। সহজ করে লেখা হলো, একবার পড়ে নিন।"
    >
      <PolicySection title="অর্ডার">
        <PolicyList
          items={[
            "অর্ডার করার পর আমরা ফোন করে অর্ডার কনফার্ম করি। ফোনে কনফার্ম না হলে অর্ডার বাতিল হতে পারে।",
            "সঠিক নাম, মোবাইল নম্বর ও ঠিকানা দেওয়া আপনার দায়িত্ব।",
            "ভুয়া বা সন্দেহজনক অর্ডার আমরা বাতিল করতে পারি।",
          ]}
        />
      </PolicySection>

      <PolicySection title="দাম ও ডেলিভারি">
        <PolicyList
          items={[
            "সব দাম টাকায় লেখা। ডেলিভারি চার্জ আলাদা: ঢাকা সিটি (উত্তর ও দক্ষিণ সিটি কর্পোরেশন) আর ঢাকা সিটির বাইরের চার্জ ভিন্ন। অর্ডার দেওয়ার আগে ফর্মে চার্জ দেখানো হয়।",
            "অর্ডারের সময় যে দাম দেখেছেন, সেই দামই দেবেন।",
            "ডেলিভারির সময় এলাকা অনুযায়ী আলাদা হতে পারে। অর্ডার কনফার্মের সময় জানিয়ে দেওয়া হয়।",
            "ছবির সাথে আসল পণ্যের রং বা আকারে সামান্য পার্থক্য থাকতে পারে।",
          ]}
        />
      </PolicySection>

      <PolicySection title="পেমেন্ট">
        <PolicyList
          items={[
            "ক্যাশ অন ডেলিভারি: পণ্য হাতে পেয়ে ডেলিভারি ম্যানকে টাকা দেবেন।",
            "অগ্রিম পেমেন্ট: অর্ডার ফর্মে দেখানো মাধ্যমে (বিকাশ, নগদ, রকেট বা ব্যাংক) শুধু ডেলিভারি চার্জ বা পুরো টাকা আগে পাঠালে ছাড় পাবেন। একটি অর্ডারে একটি ছাড়ই পাবেন। পেমেন্ট যাচাই করার পর অর্ডার কনফার্ম হয়।",
            "ভুল ট্রানজেকশন আইডি দিলে বা টাকা না পেলে অর্ডার কনফার্ম হবে না।",
            "পার্সেল গ্রহণ না করলে অগ্রিম ডেলিভারি চার্জ ফেরতযোগ্য নয়।",
          ]}
        />
      </PolicySection>

      <PolicySection title="রিটার্ন ও টাকা ফেরত">
        <PolicyText>
          নষ্ট, ভুল বা ত্রুটিপূর্ণ পণ্য পেলে ডেলিভারির 3 দিনের মধ্যে জানাতে হবে। বিস্তারিত দেখুন{" "}
          <Link href="/return-policy" className="font-semibold text-brand-dark underline">
            রিটার্ন নীতি
          </Link>
          ।
        </PolicyText>
      </PolicySection>

      <PolicySection title="আপনার তথ্য">
        <PolicyText>
          আপনার তথ্য কীভাবে ব্যবহার হয়, তা পড়ুন{" "}
          <Link href="/privacy" className="font-semibold text-brand-dark underline">
            প্রাইভেসি পলিসি
          </Link>{" "}
          পেজে।
        </PolicyText>
      </PolicySection>

      <PolicySection title="যোগাযোগ">
        <PolicyContact />
      </PolicySection>
    </PolicyPage>
  );
}
