"use client";
export default function CleanCachePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">Clean Cache</h1>
      <p>Clear your local cache and reset temporary data.</p>
      <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">
        Clean Cache
      </button>
      {/* Add cache cleaning logic here */}
    </div>
  );
}
