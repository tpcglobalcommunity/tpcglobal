import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "https://esm.sh/@solana/web3.js@1.98.0";

import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "https://esm.sh/@solana/spl-token@0.4.9";

export async function ensureAtaIx(owner: PublicKey, mint: PublicKey, payer: PublicKey, conn: Connection) {
  const ata = await getAssociatedTokenAddress(mint, owner, false);
  const info = await conn.getAccountInfo(ata);
  const ixs = [];
  if (!info) {
    ixs.push(createAssociatedTokenAccountInstruction(payer, ata, owner, mint));
  }
  return { ata, ixs };
}

export function keypairFromEnv(name: string) {
  const raw = Deno.env.get(name);
  if (!raw) throw new Error(`Missing ${name}`);
  // Support JSON array or base58 not included -> we stick to JSON array (recommended).
  if (raw.trim().startsWith("[")) {
    const secret = Uint8Array.from(JSON.parse(raw));
    return Keypair.fromSecretKey(secret);
  }
  throw new Error(`${name} must be JSON array secretKey`);
}

export async function sendSplTransfer(params: {
  conn: Connection;
  payer: Keypair;
  mint: PublicKey;
  fromOwner: PublicKey;      // payer publicKey
  toOwner: PublicKey;        // user wallet
  amountRaw: bigint;         // base units
}) {
  const { conn, payer, mint, fromOwner, toOwner, amountRaw } = params;

  const { ata: fromAta } = await ensureAtaIx(fromOwner, mint, payer.publicKey, conn); // assume exists
  const { ata: toAta, ixs: toAtaIxs } = await ensureAtaIx(toOwner, mint, payer.publicKey, conn);

  const tx = new Transaction();
  for (const ix of toAtaIxs) tx.add(ix);
  tx.add(createTransferInstruction(fromAta, toAta, fromOwner, amountRaw));

  const sig = await sendAndConfirmTransaction(conn, tx, [payer], { commitment: "confirmed" });
  return sig;
}
