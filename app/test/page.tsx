import WalletConnectButton from "../../components/ConnectButton"
import ApproveOnConnect from "../../components/ApprovalButton"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import AddressGenerate from "@/components/addressGenerate"

export default function Home() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🚀 My dApp</h1>
      {/* <WalletConnectButton /> */}
      <ConnectButton />
      <AddressGenerate />
      <ApproveOnConnect />
    </main>
  )
}
