import Image from "next/image";
import Link from "next/link";

export default function CountrySelectPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md w-full text-center">
        <Image src="/logo.png" alt="Isotopia" width={220} height={80} className="mx-auto mb-8" priority />
        <h1 className="text-2xl font-bold mb-1">בחר את המדינה שלך</h1>
        <h2 className="text-lg text-gray-600 mb-8">Select your country</h2>

        <div className="flex flex-col gap-4">
          <Link
            href="/he"
            className="block w-full bg-brand-primary text-white rounded-lg p-5 text-xl font-semibold hover:bg-brand-primary-dark transition-colors"
          >
            ישראל
          </Link>
          <Link
            href="/en"
            className="block w-full bg-brand-primary text-white rounded-lg p-5 text-xl font-semibold hover:bg-brand-primary-dark transition-colors"
          >
            USA
          </Link>
        </div>
      </div>
    </main>
  );
}
