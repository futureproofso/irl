import * as bech32 from 'bech32';
import { Buffer } from 'buffer';

export const generateKeypair = async () => {
    const keypair = await window.crypto.subtle.generateKey(
        {
            name: "ECDSA",
            namedCurve: "P-384",
        },
        true,
        ["sign", "verify"],
    );
    return {
        publicKey: await getPublicKey(keypair),
        privateKey: await getPrivateKey(keypair)
    }
}

async function getPublicKey(keypair: CryptoKeyPair) {
    return window.crypto.subtle.exportKey("jwk", keypair.publicKey);
}

async function getPrivateKey(keypair: CryptoKeyPair) {
    return window.crypto.subtle.exportKey("jwk", keypair.privateKey);
}

export async function signMessage(privateKey: CryptoKey, message: string) {
    const encoded = encodeMessage(message);
    const signature = await window.crypto.subtle.sign(
        {
            name: "ECDSA",
            hash: { name: "SHA-384" },
        },
        privateKey,
        encoded
    );

    return new Uint8Array(signature, 0, 5);
}

export async function verifyMessage(publicKey: CryptoKey, message: string, signature: Buffer) {
    const encoded = encodeMessage(message);
    const result = await window.crypto.subtle.verify(
        {
            name: "ECDSA",
            hash: { name: "SHA-384" },
        },
        publicKey,
        signature,
        encoded
    );
    return result
}

function encodeMessage(message: string) {
    let enc = new TextEncoder();
    return enc.encode(message);
}



async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "ECDSA",
        namedCurve: "P-384",
      },
      true,
      ["verify"],
    );
  }

export async function publicKeyToAddress(jwk: JsonWebKey): Promise<string> {
   const key = await importPublicKey(jwk);
   const rawKey = await window.crypto.subtle.exportKey("raw", key);
   return await constructAddress(Buffer.from(rawKey));
}

async function constructAddress(key: Buffer, version: number = 0x0) {
    const ver = Buffer.from([version])
    const dig = (await crypto.subtle.digest("SHA-256", key)).slice(1);
    const buf = Buffer.concat([ver, Buffer.from(dig)])
    if (buf.byteLength !== 32){
        throw Error(`Invalid buffer byte length: ${buf.byteLength}`)
    }
    return bech32.bech32.encode('pub', bech32.bech32.toWords(buf))
}