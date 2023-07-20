const Gun = require("gun");

export interface PublicDatabase {
  _db: any;
  setupComplete: boolean;
  setup(): Promise<void>;
  publishHandle({ space, publicKey, handle }: any): Promise<any>;
  publishProfile({ space, publicKey, profileData }: any): Promise<any>;
}

export class gunDb implements PublicDatabase {
  _db: any;
  setupComplete: boolean;

  constructor() {
    this._db = undefined;
    this.setupComplete = false;
  }

  async setup() {
    this._db = Gun();
    this.setupComplete = true;
  }

  async getPublicKey({ space, handle }: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db
        .get(`fp:${space}-handles`)
        .get(handle)
        .once(async (value: any) => {
          if (!value) reject(undefined);
          resolve(value);
        });
    });
  }

  async getProfile({ space, publicKey }: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db
        .get(`fp:${space}-profiles`)
        .get(publicKey)
        .once(async (value: any) => {
          if (!value) reject(undefined);
          resolve(value);
        });
    });
  }

  async publishHandle({ space, publicKey, handle }: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db.get(`fp:${space}-handles`).put(
        {
          [handle]: publicKey,
        },
        (ack: any) => {
          if (ack.err) reject(ack.err);
          resolve(ack.ok);
        },
      );
    });
  }

  async publishProfile({ space, publicKey, profileData }: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db.get(`fp:${space}-profiles`).put(
        {
          [publicKey]: profileData,
        },
        (ack: any) => {
          if (ack.err) reject(ack.err);
          resolve(ack.ok);
        },
      );
    });
  }
}
