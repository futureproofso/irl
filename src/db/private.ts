/* eslint-disable no-restricted-globals */
import { IDBPDatabase, openDB } from "idb";

const DB_NAME = "fp";
const DB_VERSION = 1;
const DB_SETTINGS_STORE_NAME = "settings";
const DB_HANDLES_STORE_NAME = "handles";
const DB_PROFILES_STORE_NAME = "profiles";

export interface PrivateDatabase {
  _db: any;
  setupComplete: boolean;
  setup(): Promise<void>;
  getPublicKey(): Promise<JsonWebKey>;
  getProfile(): Promise<string | undefined>;
  getProfilesFetchTimestamp(): Promise<string | undefined>;
  getRemoteAddress(handle: string): Promise<string | undefined>;
  getRemoteProfile(userAddress: string): Promise<string | undefined>;
  saveKeypair(keypair: {
    publicKey: JsonWebKey;
    privateKey: JsonWebKey;
  }): Promise<void>;
  saveProfile(profileData: string): Promise<void>;
  saveProfilesFetchTimestamp(timestamp: string): Promise<void>;
  saveRemoteHandle(userAddress: string, handle: string): Promise<void>;
  saveRemoteProfile(userAddress: string, profileData: string): Promise<void>;
}

export class idbDatabase implements PrivateDatabase {
  _db: IDBPDatabase | undefined;
  setupComplete: boolean;

  constructor() {
    this._db = undefined;
    this.setupComplete = false;
  }

  async setup() {
    console.log("Setting up database");
    this._db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(DB_SETTINGS_STORE_NAME);
        db.createObjectStore(DB_HANDLES_STORE_NAME);
        db.createObjectStore(DB_PROFILES_STORE_NAME);
      },
    });
    console.log("Setup complete");
    this.setupComplete = true;
  }

  async getPublicKey() {
    if (this._db) {
      const keypair = await this._db.get(DB_SETTINGS_STORE_NAME, "keypair");
      if (keypair) {
        return keypair.publicKey;
      }
    }
  }

  async getProfile(): Promise<string | undefined> {
    if (this._db) {
      return await this._db.get(DB_SETTINGS_STORE_NAME, "profile");
    } else {
      throw Error("Database is not set up");
    }
  }

  async getProfilesFetchTimestamp(): Promise<string | undefined> {
    if (this._db) {
      return await this._db.get(
        DB_SETTINGS_STORE_NAME,
        "profilesFetchTimestamp",
      );
    } else {
      throw Error("Database is not set up");
    }
  }

  async saveKeypair(keypair: {
    publicKey: JsonWebKey;
    privateKey: JsonWebKey;
  }): Promise<void> {
    if (this._db) {
      await this._db.put(DB_SETTINGS_STORE_NAME, keypair, "keypair");
    }
  }

  async saveProfile(profileData: string): Promise<void> {
    if (this._db) {
      await this._db.put(DB_SETTINGS_STORE_NAME, profileData, "profile");
    } else {
      throw Error("Database is not set up");
    }
  }

  async saveProfilesFetchTimestamp(timestamp: string): Promise<void> {
    if (this._db) {
      await this._db.put(
        DB_SETTINGS_STORE_NAME,
        timestamp,
        "profilesFetchTimestamp",
      );
    } else {
      throw Error("Database is not set up");
    }
  }

  async getRemoteAddress(handle: string): Promise<string | undefined> {
    if (this._db) {
      return await this._db.get(DB_HANDLES_STORE_NAME, handle.toLowerCase());
    } else {
      throw Error("Database is not set up");
    }
  }

  async getRemoteProfile(userAddress: string): Promise<string | undefined> {
    if (this._db) {
      return await this._db.get(DB_PROFILES_STORE_NAME, userAddress);
    } else {
      throw Error("Database is not set up");
    }
  }

  async saveRemoteHandle(userAddress: string, handle: string): Promise<void> {
    if (this._db) {
      await this._db.put(
        DB_HANDLES_STORE_NAME,
        userAddress,
        handle.toLowerCase(),
      );
    } else {
      throw Error("Database is not set up");
    }
  }

  async saveRemoteProfile(
    userAddress: string,
    profileData: string,
  ): Promise<void> {
    if (this._db) {
      await this._db.put(DB_PROFILES_STORE_NAME, profileData, userAddress);
    } else {
      throw Error("Database is not set up");
    }
  }
}
