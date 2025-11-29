"use client"
import { useState, useEffect } from "react"

interface Transaction {
  id: string;
  userId: string;
  type: string;
  coin: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    email: string;
    userId: string;
    name: string | null;
  };
}

export default function WithdrawPage() {
  const [email, setEmail] = useState("")
  const [network, setNetwork] = useState("USDT")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions/admin")
        const data = await response.json()
        if (response.ok) {
          setTransactions(data.filter((tx: Transaction) => tx.type === 'withdrawal'))
        } else {
          throw new Error(data.error || "Failed to fetch transactions")
        }
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchTransactions()
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: email,
          network,
          balance: parseFloat(amount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // Create a transaction record
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'withdrawal',
          coin: network,
          amount: parseFloat(amount),
          userId: data.userId // Assuming the withdraw response returns the userId
        })
      });

      setSuccess(`Successfully withdrew ${amount} ${network} from ${email}`)
      setEmail("")
      setAmount("")

      // Refresh transactions
      const res = await fetch("/api/transactions/admin")
      const updatedData = await res.json()
      if (res.ok) {
        setTransactions(updatedData.filter((tx: Transaction) => tx.type === 'withdrawal'))
      }

    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-red-500">Withdraw from Wallet</h1>
          <form onSubmit={handleWithdraw}>
            <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              User Address
            </label>
            <input
              type="input"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 text-blue-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="0x1234...abcd"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="network" className="block text-blue-500 text-sm font-medium text-gray-700">
              Network
            </label>
            <select
              id="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="mt-1 text-blue-500 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option>BTC</option>
                <option>ETH</option>
                <option>USDT</option>
                <option>USDC</option>
                <option>BNB</option>
                <option>DAI</option>
                <option>MATIC</option>
                <option>XRP</option>
                <option>SOL</option>
                <option>ADA</option>
                <option>DOGE</option>
                <option>DOT</option>
                <option>SHIB</option>
                <option>TRX</option>
                <option>LTC</option>
                <option>AVAX</option>
                <option>WBTC</option>
                <option>LINK</option>
                <option>UNI</option>
                <option>BCH</option>
                <option>XLM</option>
                <option>VET</option>
                <option>THETA</option>
                <option>FIL</option>
                <option>ICP</option>
                <option>AAVE</option>
                <option>EOS</option>
                <option>XMR</option>
                <option>ZEC</option>
                <option>ALGO</option>
                <option>ATOM</option>
                <option>MKR</option>
                <option>NEO</option>
                <option>KSM</option>
                <option>FTM</option>
                <option>EGLD</option>
              {/* Add other networks as needed */}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 text-blue-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="100.00"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Withdraw
          </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Withdrawal History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coin</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.user.userId || tx.user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.coin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
