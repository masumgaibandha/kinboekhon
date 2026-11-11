import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-8 bg-footer text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-3">
          <Image src="/brand/icon-circle.svg" alt="" width={40} height={40} className="h-10 w-10" />
          <div>
            <p className="text-lg font-bold">কিনবো এখন</p>
            <p className="text-sm text-white/70">দরকার যখন, কিনবো এখন</p>
          </div>
        </div>
        <p className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
          © কিনবো এখন · kinboekhon.com
        </p>
      </div>
    </footer>
  );
}
