// server.ts
import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from "bip39";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import { bech32 } from "bech32";
import * as bitcoin from "bitcoinjs-lib";
import nacl from "tweetnacl";
import { derivePath as ed25519DerivePath } from "ed25519-hd-key";
import { createHash } from "node:crypto";
import { Wallet as EthersWallet, HDNodeWallet, ethers } from "ethers";
import bs58 from "bs58";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";

const bip321 = BIP32Factory(ecc);

// ---------- Helpers ----------
export function generateMnemonic12(){
  return generateMnemonic(128); // 12 words
}
export function ensureMnemonic(m) {
  if (!validateMnemonic(m)) throw new Error("Invalid mnemonic");
  return m;
}
function sha256(buf){
  return createHash("sha256").update(buf).digest();
}
function ripemd160(buf) {
  return createHash("ripemd160").update(buf).digest();
}

// ---------- Derivations ----------
export function deriveEvm(mnemonic, account = 0, index = 0){
  const path = `m/44'/60'/${account}'/0/${index}`;
  const w = HDNodeWallet.fromPhrase(mnemonic, undefined, path);
  return {
    chain: "evm",
    derivationPath: path,
    algorithm: "secp256k1",
    address: w.address,
    publicKey: w.publicKey,
    privateKeyHex: w.privateKey,
  };
}

export function deriveBitcoin(mnemonic, account = 0, index = 0) {
  const seed = mnemonicToSeedSync(mnemonic);
  const root = bip321.fromSeed(seed);
  const path = `m/84'/0'/${account}'/0/${index}`;
  const child = root.derivePath(path);
  if (!child.privateKey || !child.publicKey) throw new Error("BTC child key missing");
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(child.publicKey),
    network: bitcoin.networks.bitcoin,
  });
  if (!address) throw new Error("BTC address gen failed");
  return {
    chain: "bitcoin",
    derivationPath: path,
    algorithm: "secp256k1",
    address,
    publicKey: Buffer.from(child.publicKey).toString("hex"),
    privateKeyHex: "0x" + Buffer.from(child.privateKey).toString("hex"),
  };
}

export function deriveCosmos(mnemonic, hrp = "cosmos", account = 0, index = 0) {
  const seed = mnemonicToSeedSync(mnemonic);
  const root = bip321.fromSeed(seed);
  const path = `m/44'/118'/${account}'/0/${index}`;
  const child = root.derivePath(path);
  if (!child.privateKey || !child.publicKey) throw new Error("Cosmos child key missing");
  const pubkeyCompressed = child.publicKey;
  const addrBytes = ripemd160(sha256(Buffer.from(pubkeyCompressed)));
  const words = bech32.toWords(addrBytes);
  const address = bech32.encode(hrp, words);
  return {
    chain: "cosmos",
    derivationPath: path,
    algorithm: "secp256k1",
    address,
    publicKey: Buffer.from(pubkeyCompressed).toString("hex"),
    privateKeyHex: "0x" + Buffer.from(child.privateKey).toString("hex"),
  };
}

export function deriveSolana(mnemonic, account = 0, change = 0) {
  const path = `m/44'/501'/${account}'/${change}'`;
  const seed = mnemonicToSeedSync(mnemonic);
  const { key } = ed25519DerivePath(path, seed.toString("hex"));
  const kp = nacl.sign.keyPair.fromSeed(Buffer.from(key));
  const publicKeyBase58 = bs58.encode(kp.publicKey);
  const privateKeyHex = "0x" + Buffer.from(kp.secretKey.slice(0, 32)).toString("hex");
  return {
    chain: "solana",
    derivationPath: path,
    algorithm: "ed25519",
    address: publicKeyBase58,
    publicKey: publicKeyBase58,
    privateKeyHex,
  };
}

// ---------- Bundle ----------
export function deriveBundle(mnemonic) {
  return {
    evm: deriveEvm(mnemonic),
    bitcoin: deriveBitcoin(mnemonic),
    solana: deriveSolana(mnemonic),
    cosmos: deriveCosmos(mnemonic),
  };
}

// ---------- Balance ----------
const ETHERSCAN_API_KEY = "1BQ1IYTDEMCUHNFIS97WHE13R76VWAQXER";
const BSC_RPC_URL = "https://bsc-dataseed.binance.org/"; // Binance official RPC
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"; // Solana official RPC
const SOLANA_PUBLIC_RPC = "https://solana-api.syndica.io/access-token/your-token-here"; // Alternative: Helius or Syndica

const ethProvider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/LPEbnXNE0YjvHGrfLUSuAjsRNfpTNApD`);
const bscProvider = new ethers.JsonRpcProvider(BSC_RPC_URL);
const solanaConnection = new Connection(SOLANA_RPC_URL);

const tokenAddresses = {
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
};

export async function getBalance(symbol, address) {
  switch (symbol.toUpperCase()) {
    case "ETH": {
      if (!ethers.isAddress(address)) throw new Error("Invalid Ethereum address");
      const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
      const res = await axios.get(url);

      if (res.data.status !== "1") {
        throw new Error(`Etherscan error: ${res.data.message}`);
      }

      const balanceWei = res.data.result;
      return Number(ethers.formatEther(balanceWei));
    }

    case "BNB": {
      return Number(ethers.formatEther(await bscProvider.getBalance(address)));
    }

    case "USDT": {
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];
      const contract = new ethers.Contract(tokenAddresses.USDT, erc20Abi, ethProvider);
      const rawBalance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      return Number(ethers.formatUnits(rawBalance, decimals));
    }

    case "SOL": {
      try {
        // Try official RPC first
        const pubkey = new PublicKey(address);
        const lamports = await solanaConnection.getBalance(pubkey);
        return lamports / 1e9;
      } catch (error) {
        
        
        // Alternative: Use blockchain.com API
        try {
          const res = await axios.get(`https://blockchain.info/rawaddr/${address}`);
          return res.data.final_balance / 1e8;
        } catch (fallbackError) {
          throw new Error(`Solana balance check failed: ${error.message}`);
        }
      }
    }

    case "BTC": {
      try {
        // Multiple reliable Bitcoin API options:
        
        // Option 1: Blockchain.com
        const res1 = await axios.get(`https://blockchain.info/rawaddr/${address}`);
        return res1.data.final_balance / 1e8;
        
        // Option 2: Blockchair (fallback)
        // const res2 = await axios.get(`https://api.blockchair.com/bitcoin/dashboards/address/${address}`);
        // return res2.data.data[address].address.balance / 1e8;
        
        // Option 3: BlockCypher (fallback)
        // const res3 = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
        // return res3.data.balance / 1e8;
        
      } catch (error) {
        throw new Error(`Bitcoin balance check failed: ${error.message}`);
      }
    }

    case "LTC": {
      try {
        // Use BlockCypher for LTC
        const res = await axios.get(`https://api.blockcypher.com/v1/ltc/main/addrs/${address}/balance`);
        return res.data.balance / 1e8;
      } catch (error) {
        throw new Error(`Litecoin balance check failed: ${error.message}`);
      }
    }

    case "DOGE": {
      try {
        // Use BlockCypher for DOGE
        const res = await axios.get(`https://api.blockcypher.com/v1/doge/main/addrs/${address}/balance`);
        return res.data.balance / 1e8;
      } catch (error) {
        throw new Error(`Dogecoin balance check failed: ${error.message}`);
      }
    }

    default:
      throw new Error(`Unsupported symbol: ${symbol}`);
  }
}

// ---------- Enhanced balance checking with retries ----------
export async function getBalanceWithRetry(symbol, address, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await getBalance(symbol, address);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

// ---------- Runner ----------
async function findFundedWallet() {
  let checked = 0;
  
  while (true) {
    try {
      const mnemonic = generateMnemonic12();
      const bundle = deriveBundle(mnemonic);
      
      // Check multiple chains
    //   const [ethBalance, btcBalance, solBalance] = await Promise.all([
      const [ethBalance, btcBalance] = await Promise.all([
        getBalanceWithRetry("ETH", bundle.evm.address),
        getBalanceWithRetry("BTC", bundle.bitcoin.address),
        // getBalanceWithRetry("SOL", bundle.solana.address)
      ]);
      
      checked++;
    //   console.log(`Checked ${checked}: ETH=${ethBalance}, BTC=${btcBalance}, SOL=${solBalance}`);
      
      
    //   if (ethBalance > 0 || btcBalance > 0 || solBalance > 0) {
      if (ethBalance > 0 || btcBalance > 0 ) {
        
        console.log({
          mnemonic,
          addresses: {
            eth: bundle.evm.address,
            btc: bundle.bitcoin.address,
            // sol: bundle.solana.address
          },
          balances: {
            eth: ethBalance,
            btc: btcBalance,
            // sol: solBalance
          }
        });
        break;
      }
      
      // Respectful delay to avoid API rate limiting
      await new Promise(r => setTimeout(r, 3000));
      
    } catch (error) {
      console.error("Error checking wallet:", error.message);
      await new Promise(r => setTimeout(r, 5000)); // Longer delay on error
    }
  }
}

// Start the search
findFundedWallet().catch(console.error);