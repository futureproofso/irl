const Gun = require("gun");

export interface PublicDatabase {
  _db: any;
  setupComplete: boolean;
  setup(): Promise<void>;
}

export class publicDb implements PublicDatabase {
  _db: any;
  setupComplete: boolean;

  constructor() {
    this._db = undefined;
    this.setupComplete = false;
  }

  async setup() {
    this._db = Gun(['https://gun-manhattan.herokuapp.com/gun']);
    this.setupComplete = true;
  }

  async getPublicKey({ appName, handle }: any) {
    return new Promise((resolve, reject) => {
      this._db
        .get(`${appName}-handles`)
        .get(handle)
        .once(async (value: any) => {
            resolve(value);
        });
    });
  }

  async getProfile({ appName, publicKey }: any) {
    return new Promise((resolve, reject) => {
      this._db
        .get(`${appName}-profiles`)
        .get(publicKey)
        .once(async (value: any) => {
            resolve(value);
        });
    });
  }

  publishHandle({ appName, handle, publicKey }: any) {
    this._db.get(`${appName}-handles`).put({
        [handle]: publicKey
    })
  }

  publishProfile({ appName, publicKey, profile }: any) {
    this._db.get(`${appName}-profiles`).put({
      [publicKey]: profile,
    });
  }
}
