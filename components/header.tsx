import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg">
      <div className="container-safe py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-purple-600 font-bold">🏦</span>
            <span className="text-lg font-semibold">ETH wallet</span>
          </Link>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Link href="#" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-4 rounded-xl shadow hover:shadow-lg transition-all">Receive</Link>
          <Link href="#" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-4 rounded-xl shadow hover:shadow-lg transition-all">Send</Link>
          <Link href="#" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-4 rounded-xl shadow hover:shadow-lg transition-all">Convert</Link>
        </div>
      </div>
    </header>
  );
}