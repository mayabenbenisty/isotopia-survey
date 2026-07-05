import Image from "next/image";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md w-full text-center" dir="rtl">
        <Image src="/logo.png" alt="Isotopia" width={200} height={73} className="mx-auto mb-8" />
        <h1 className="text-2xl font-bold mb-2 text-brand-primary">תודה רבה!</h1>
        <p className="text-gray-600">התשובות שלך נשלחו בהצלחה ובאופן אנונימי.</p>
        <p className="text-gray-600 mt-4" dir="ltr">Thank you! Your responses were submitted anonymously.</p>
      </div>
    </main>
  );
}
