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
          <button
            disabled
            className="block w-full bg-gray-200 text-gray-500 rounded-lg p-5 text-xl font-semibold cursor-not-allowed"
            title="Coming soon"
          >
            USA <span className="block text-sm font-normal">(בקרוב / coming soon)</span>
          </button>
        </div>
      </div>
    </main>
  );
}
