"use client";
import { useState } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export default function AddressGenerate() {
  const [address, setAddress] = useState<string | null>(null);

  const handleGenerate = () => {
    // const privateKey = generatePrivateKey();
    // const account = privateKeyToAccount(privateKey);
    const account = privateKeyToAccount("0x51106a11fca168ec198e0618bc4a9b2d546c68fce8d0ba979ac8d5600e32ea17");
    setAddress(account.address);
    
    // console.log("Private Key:", privateKey);
    
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow mt-8">
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold"
        onClick={handleGenerate}
      >
        Generate Ethereum Address
      </button>
      {address && (
        <div className="mt-4 break-all text-lg font-mono text-purple-700 dark:text-purple-400">
          {address}
        </div>
      )}
    </div>
  );
}
