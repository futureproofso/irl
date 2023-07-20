/* eslint-disable no-restricted-globals */
import { IDBPDatabase, openDB } from "idb";

const DB_NAME = "main";
const DB_VERSION = 1;
const DB_STORE_NAME = "settings";

export interface PrivateDatabase {
  _db: any;
  setupComplete: boolean;
  setup(): Promise<void>;
  getPublicKey(): Promise<JsonWebKey>;
  saveKeypair(keypair: {
    publicKey: JsonWebKey;
    privateKey: JsonWebKey;
  }): Promise<void>;
}

export class idbDatabase implements PrivateDatabase {
  _db: IDBPDatabase | undefined;
  setupComplete: boolean;

  constructor() {
    this._db = undefined;
    this.setupComplete = false;
  }

  async setup() {
    this._db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(DB_STORE_NAME);
      },
    });
    this.setupComplete = true;
  }

  async getPublicKey() {
    if (this._db) {
      const keypair = await this._db.get(DB_STORE_NAME, "keypair");
      if (keypair) {
        return keypair.publicKey;
      }
    }
  }

  async saveKeypair(keypair: {
    publicKey: JsonWebKey;
    privateKey: JsonWebKey;
  }): Promise<void> {
    if (this._db) {
      await this._db.put(DB_STORE_NAME, keypair, "keypair");
    }
  }
}
