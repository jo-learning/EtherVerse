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
// const INFURA_URL = "https://eth-mainnet.g.alchemy.com/v2/JPak6EkEO3LVAzts1a69W";
const INFURA_URL = "https://eth-mainnet.g.alchemy.com/v2/LPEbnXNE0YjvHGrfLUSuAjsRNfpTNApD";
// const BSC_URL = "https://bsc-mainnet.g.alchemy.com/v2/JPak6EkEO3LVAzts1a69W"; // ⚠️ fix your BSC RPC
const BSC_URL = "https://bsc-mainnet.g.alchemy.com/v2/LPEbnXNE0YjvHGrfLUSuAjsRNfpTNApD"; // ⚠️ fix your BSC RPC
// const SOLANA_RPC = "https://solana-mainnet.g.alchemy.com/v2/JPak6EkEO3LVAzts1a69W";
const SOLANA_RPC = "https://solana-mainnet.g.alchemy.com/v2/LPEbnXNE0YjvHGrfLUSuAjsRNfpTNApD";

const ethProvider = new ethers.JsonRpcProvider(INFURA_URL);
const bscProvider = new ethers.JsonRpcProvider(BSC_URL);

const tokenAddresses = {
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
};

// export async function getBalance(symbol, address) {
//   switch (symbol.toUpperCase()) {
//     case "ETH":
//       if (!ethers.isAddress(address)) throw new Error("Invalid Ethereum address");
//       return Number(ethers.formatEther(await ethProvider.getBalance(address)));

//     case "BNB":
//       return Number(ethers.formatEther(await bscProvider.getBalance(address)));

//     case "USDT": {
//       const erc20Abi = [
//         "function balanceOf(address owner) view returns (uint256)",
//         "function decimals() view returns (uint8)",
//       ];
//       const contract = new ethers.Contract(tokenAddresses.USDT, erc20Abi, ethProvider);
//       const rawBalance = await contract.balanceOf(address);
//       const decimals = await contract.decimals();
//       return Number(ethers.formatUnits(rawBalance, decimals));
//     }

//     case "SOL": {
//       const connection = new Connection(SOLANA_RPC);
//       const pubkey = new PublicKey(address);
//       const lamports = await connection.getBalance(pubkey);
//       return lamports / 1e9;
//     }

//     case "BTC":
//     case "LTC":
//     case "DOGE": {
//       const network = symbol.toUpperCase() === "BTC" ? "btc" : symbol.toLowerCase();
//       const url = `https://api.blockcypher.com/v1/${network}/main/addrs/${address}/balance`;
//       const res = await axios.get(url);
//       return res.data.balance / 1e8;
//     }

//     default:
//       throw new Error(`Unsupported symbol: ${symbol}`);
//   }
// }


const ETHERSCAN_API_KEY = "CUKC462DUV4UTAPINWDTEYSDNKMM4A7Y3M"; // Get from etherscan.io

export async function getBalance(symbol, address) {
  switch (symbol.toUpperCase()) {
    case "ETH": {
      if (!ethers.isAddress(address)) throw new Error("Invalid Ethereum address");
      const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
      const res = await axios.get(url);

      if (res.data.status !== "1") {
        throw new Error(`Etherscan error: ${res.data.message}`);
      }

      // Etherscan returns balance in WEI (string)
      const balanceWei = res.data.result;
      return Number(ethers.formatEther(balanceWei));
    }

    case "BNB":
      return Number(ethers.formatEther(await bscProvider.getBalance(address)));

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
      const connection = new Connection(SOLANA_RPC);
      const pubkey = new PublicKey(address);
      const lamports = await connection.getBalance(pubkey);
      return lamports / 1e9;
    }

    case "BTC":
    case "LTC":
    case "DOGE": {
      const network = symbol.toUpperCase() === "BTC" ? "btc" : symbol.toLowerCase();
      const url = `https://api.blockcypher.com/v1/${network}/main/addrs/${address}/balance`;
      const res = await axios.get(url);
      return res.data.balance / 1e8;
    }

    default:
      throw new Error(`Unsupported symbol: ${symbol}`);
  }
}


// ---------- Runner ----------
async function findFundedWallet() {
  while (true) {
    const mnemonic = generateMnemonic12();
    const bundle = deriveBundle(mnemonic);
    const balance = await getBalance("ETH", bundle.evm.address);
    
    if (balance > 0) {
      
      
      break;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

findFundedWallet();
