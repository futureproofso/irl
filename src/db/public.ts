const Gun = require("gun");

export interface PublicDatabase {
  _db: any;
  setupComplete: boolean;
  setup(): Promise<void>;
  getUserAddress({ space, handle }: any): Promise<any>;
  getProfile({ space, userAddress }: any): Promise<any>;
  publishHandle({ space, userAddress, handle }: any): Promise<any>;
  publishProfile({ space, userAddress, profileData }: any): Promise<any>;
}

export class gunDb implements PublicDatabase {
  _db: any;
  setupComplete: boolean;

  constructor() {
    this._db = undefined;
    this.setupComplete = false;
  }

  async setup() {
    this._db = Gun(["https://gun-relay-peer.herokuapp.com/gun"]);
    this.setupComplete = true;
  }

  async getUserAddress({ space, handle }: any): Promise<any> {
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

  async getProfile({ space, userAddress }: any): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      this._db
        .get(`fp:${space}-profiles`)
        .get(userAddress)
        .once(async (value: any) => {
          if (!value) reject(undefined);
          resolve(value);
        });
    });
  }

  async publishHandle({ space, userAddress, handle }: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db.get(`fp:${space}-handles`).put(
        {
          [handle.toLowerCase()]: userAddress,
        },
        (ack: any) => {
          if (ack.err) reject(ack.err);
          resolve(ack.ok);
        },
      );
    });
  }

  async publishProfile({ space, userAddress, profileData }: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db.get(`fp:${space}-profiles`).put(
        {
          [userAddress]: profileData,
        },
        (ack: any) => {
          if (ack.err) reject(ack.err);
          resolve(ack.ok);
        },
      );
    });
  }
}
