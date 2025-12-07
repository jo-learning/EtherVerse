import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from "bip39";
import * as bip32 from "bip32";
import { bech32 } from "bech32";
import * as bitcoin from "bitcoinjs-lib";
import nacl from "tweetnacl";
import { derivePath as ed25519DerivePath } from "ed25519-hd-key";
import { createHash, randomBytes } from "node:crypto";
import { Wallet as EthersWallet, HDNodeWallet } from "ethers";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
// import nacl from 'tweetnacl';
import bs58 from 'bs58';
// import { derivePath as ed25519DerivePath } from 'ed25519-hd-key';
// don't import at top
// const solanaWeb3 = await import('@solana/web3.js');
// const { PublicKey } = solanaWeb3;


const bip321 = BIP32Factory(ecc);

export type DerivedWallet = {
  chain: string;
  derivationPath: string;
  algorithm: "secp256k1" | "ed25519";
  address: string;
  publicKey: string; // hex for secp256k1, base58 for solana
  privateKeyHex?: string; // 0x.. for secp256k1, hex for ed25519 secret scalar
};

export function generateMnemonic12(): string {
  return generateMnemonic(128); // 12 words
}

export function ensureMnemonic(m: string): string {
  if (!validateMnemonic(m)) throw new Error("Invalid mnemonic");
  return m;
}

// ---------- EVM (Ethereum, Polygon, etc.) — secp256k1, m/44'/60'/0'/0/0 ----------
export function deriveEvm(
  mnemonic: string,
  account = 0,
  index = 0
): DerivedWallet {
  const path = `m/44'/60'/${account}'/0/${index}`;
  const w = HDNodeWallet.fromPhrase(mnemonic, undefined, path);
  return {
    chain: "evm",
    derivationPath: path,
    algorithm: "secp256k1",
    address: w.address,
    publicKey: w.publicKey, // 0x04.. uncompressed
    privateKeyHex: w.privateKey,
  };
}

// ---------- Bitcoin (bech32 P2WPKH) — secp256k1, m/84'/0'/0'/0/0 ----------
export function deriveBitcoin(
  mnemonic: string,
  account = 0,
  index = 0
): DerivedWallet {
  const seed = mnemonicToSeedSync(mnemonic);
  const root = bip321.fromSeed(seed);
  const path = `m/84'/0'/${account}'/0/${index}`; // BIP84 native segwit (bc1...)
  const child = root.derivePath(path);
  if (!child.privateKey || !child.publicKey)
    throw new Error("BTC child key missing");
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

// ---------- Cosmos (bech32 cosmos1...) — secp256k1, m/44'/118'/0'/0/0 ----------
function sha256(buf: Buffer): Buffer {
  return createHash("sha256").update(buf).digest();
}
function ripemd160(buf: Buffer): Buffer {
  return createHash("ripemd160").update(buf).digest();
}

export function deriveCosmos(
  mnemonic: string,
  hrp = "cosmos",
  account = 0,
  index = 0
): DerivedWallet {
  const seed = mnemonicToSeedSync(mnemonic);
  const root = bip321.fromSeed(seed);
  const path = `m/44'/118'/${account}'/0/${index}`; // Cosmos coin type 118
  const child = root.derivePath(path);
  if (!child.privateKey || !child.publicKey)
    throw new Error("Cosmos child key missing");
  const pubkeyCompressed = child.publicKey; // secp256k1 compressed
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
// ---------- Solana — ed25519 (SLIP‑0010), m/44'/501'/0'/0' ----------
export function deriveSolana(
  mnemonic: string,
  account = 0,
  change = 0
): DerivedWallet {
  const path = `m/44'/501'/${account}'/${change}'`;
  const seed = mnemonicToSeedSync(mnemonic); // 64 bytes
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


// ---------- Helper: generate a bundle ----------
export function deriveBundle(mnemonic: string) {
  return {
    evm: deriveEvm(mnemonic),
    bitcoin: deriveBitcoin(mnemonic),
    solana: deriveSolana(mnemonic),
    cosmos: deriveCosmos(mnemonic),
  };
}

export const coinClassification: Record<string, "evm" | "bitcoin" | "solana" | "cosmos" | "cardano"> = {
  BTC: "bitcoin",       // Bitcoin
  ETH: "evm",           // Ethereum
  USDT: "evm",          // ERC-20 on Ethereum by default
  BNB: "evm",           // BSC / EVM chain
  XRP: "bitcoin",       // XRP uses Ripple protocol (non-EVM)
  SOL: "solana",        // Solana
  AAVE: "evm",          // ERC-20 token
  DOT: "evm",           // Polkadot can be sr25519, but for ERC20-like versions use evm
  LINK: "evm",          // ERC-20 token
  UNI: "evm",           // ERC-20 token
  LTC: "bitcoin",       // Litecoin
//   ADA: "cardano",       // Cardano uses ed25519 derivation
  ADA: "bitcoin",       // Cardano uses ed25519 derivation
  DOGE: "bitcoin",      // Dogecoin
  EOS: "evm",           // EOS uses its own, could be "eos" network
};


export function deriveCoinWallet(mnemonic: string, symbol: string) {
  const type = coinClassification[symbol];
  switch (type) {
    case "evm":
      return deriveEvm(mnemonic);
    case "bitcoin":
      return deriveBitcoin(mnemonic);
    case "solana":
      return deriveSolana(mnemonic);
    case "cosmos":
      return deriveCosmos(mnemonic);
    case "cardano":
      // TODO: implement Cardano derivation
      throw new Error("Cardano derivation not implemented yet");
    default:
      throw new Error(`Unsupported coin: ${symbol}`);
  }
}
