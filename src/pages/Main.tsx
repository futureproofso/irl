import { useEffect, useMemo, useState } from "react";
import {
  Block,
  List,
  ListItem,
  NavLeft,
  NavRight,
  Navbar,
  Page,
} from "framework7-react";
import ProfileButton from "../components/ProfileButton";
import SearchInput from "../components/SearchInput";
import { PrivateDatabase } from "../db/private";
import { PublicDatabase } from "../db/public";
import "./Main.css";

const PubNub = require("pubnub");
const { Plus } = require("framework7-icons/react");

const ADMIN = "fp";
const SPACE = "tv_ribc";
const CHANNEL_PROFILES = `${ADMIN}-${SPACE}-profiles`;
const CHANNEL_DAPS = `${ADMIN}-${SPACE}-daps`;

interface Props {
  privateDb: PrivateDatabase;
  privateDbReady: boolean;
  publicDb: PublicDatabase;
  publicDbReady: boolean;
  userAddress: string;
}

const Main = (props: Props) => {
  const pubnub = useMemo(
    () =>
      new PubNub({
        publishKey: process.env.REACT_APP_PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY,
        userId: props.userAddress,
        ssl: process.env.NODE_ENV == "production",
      }),
    [props.userAddress],
  );

  const [loading, setLoading] = useState(false);
  const [daps, setDaps] = useState("[]");
  const [text, onChangeText] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [userHandle, setUserHandle] = useState("anon");

  useEffect(fetchHistoricalDaps, [pubnub]);
  useEffect(fetchHistoricalProfiles, [pubnub, props.privateDbReady]);
  useEffect(listenToPubsub, [pubnub]);
  useEffect(subscribeToChannel, [pubnub]);

  function fetchHistoricalDaps() {
    async function getOlderDaps() {
      setLoading(true);
      const result = await pubnub.fetchMessages({
        channels: [CHANNEL_DAPS],
        count: 100,
        includeMessageType: true,
        includeUUID: true,
        includeMeta: true,
        includeMessageActions: false,
      });
      console.log(result);
      if (result.channels[CHANNEL_DAPS]) {
        const oldDaps = (result.channels[CHANNEL_DAPS] as Array<any>).reverse();
        console.log(oldDaps);
        setDaps(JSON.stringify(oldDaps));
      }
      setLoading(false);
    }
    getOlderDaps();
  }

  function fetchHistoricalProfiles() {
    async function getLatestProfileUpdates() {
      const lastTimestamp = await props.privateDb.getProfilesFetchTimestamp();
      console.log("lastts", lastTimestamp)
      const params: any = {
        channels: [CHANNEL_PROFILES],
        count: 100,
        includeMessageType: true,
        includeUUID: true,
        includeMeta: true,
        includeMessageActions: false,
      };
      if (lastTimestamp) {
        params['end'] = lastTimestamp;
      }
      const result = await pubnub.fetchMessages(params);
      if (result.channels[CHANNEL_PROFILES]) {
        const length = result.channels[CHANNEL_PROFILES].length;
        if (length > 0) {
          const updates = (
            result.channels[CHANNEL_PROFILES] as Array<any>
          ).reverse();
          console.log("updates", updates);
          const nextTimestamp = updates[0]["timetoken"];
          if (nextTimestamp) {
            const dedupe: any = {};
            console.log("nextts", nextTimestamp);
            await props.privateDb.saveProfilesFetchTimestamp(nextTimestamp);
            await Promise.all(
              updates.map(async (profileUpdate) => {
                if (dedupe[profileUpdate.uuid]) {
                  return;
                }
                dedupe[profileUpdate.uuid] = profileUpdate;
                console.log(profileUpdate);
                const remoteHandle = JSON.parse(profileUpdate.message)["handle"];
                if (remoteHandle) {
                await props.privateDb.saveRemoteHandle(profileUpdate.uuid, remoteHandle);
                await props.privateDb.saveRemoteProfile(
                  profileUpdate.uuid,
                  profileUpdate.message,
                );
                }
              }),
            );
          }
        }
      }
    }
    if (props.privateDbReady) {
      getLatestProfileUpdates();
    }
  }

  function listenToPubsub() {
    const listener = createListener();
    pubnub.addListener(listener);
    return () => pubnub.removeListener(listener);
  }

  function subscribeToChannel() {
    pubnub.subscribe({ channels: [CHANNEL_DAPS, CHANNEL_PROFILES] });
    return () =>
      pubnub.unsubscribe({ channels: [CHANNEL_DAPS, CHANNEL_PROFILES] });
  }

  function createListener() {
    return {
      status: (e: any) => {
        if (e.category === "PNConnectedCategory") {
          console.log("Connected to pubsub");
        }
      },
      message: (e: any) => {
        if (e.channel == CHANNEL_DAPS) {
          console.log(e);
          setDaps((nextDaps) => {
            return JSON.stringify([e, ...JSON.parse(nextDaps)]);
          });
        }
        if (e.channel == CHANNEL_PROFILES) {
          if (e.publisher == props.userAddress) return;
          const handle = JSON.parse(e.message)["handle"];
          if (handle) {
            updateRemoteHandle({
              userAddress: e.publisher,
              handle: handle.toLowerCase(),
            });
          }
          updateRemoteProfile({
            userAddress: e.publisher,
            profileData: e.message,
          });
        }
      },
      presence: (presenceEvent: any) => {
        // handle presence
      },
    };
  }

  async function updateRemoteHandle({ userAddress, handle }: any) {
    await props.privateDb.saveRemoteHandle(userAddress, handle.toLowerCase());
  }

  async function updateRemoteProfile({ userAddress, profileData }: any) {
    await props.privateDb.saveRemoteProfile(userAddress, profileData);
  }

  async function publishProfileUpdate(profileData: string) {
    const nextUserHandle = JSON.parse(profileData)["handle"];
    setUserHandle(nextUserHandle);
    await publishMessage({ channel: CHANNEL_PROFILES, message: profileData });
  }

  async function publishDap(dapData: string) {
    console.log(dapData);
    await publishMessage({ channel: CHANNEL_DAPS, message: dapData });
  }

  async function publishMessage({ channel, message }: any) {
    if (!message) return;
    const payload = {
      channel,
      message,
    };
    await pubnub.publish(payload);
  }

  function toggleSearchInput(e: any) {
    e.preventDefault();
    setShowSearchInput(!showSearchInput);
  }

  return (
    <Page
      infinite
      infiniteDistance={50}
      infinitePreloader={false}
      onInfinite={() => {}}
      hideToolbarOnScroll={true}
    >
      <Navbar large>
        <NavLeft className="irl-header">irl.so</NavLeft>
        <NavRight className="irl-header-icons">
          <ProfileButton
            space={SPACE}
            userAddress={props.userAddress}
            privateDb={props.privateDb}
            publicDb={props.publicDb}
            privateDbReady={props.privateDbReady}
            onSave={publishProfileUpdate}
          />
          <div onClick={toggleSearchInput}>
            <Plus />
          </div>
        </NavRight>
      </Navbar>
      {showSearchInput && (
        <Block>
          <SearchInput
            userAddress={props.userAddress}
            userHandle={userHandle}
            space={SPACE}
            publicDb={props.publicDb}
            privateDb={props.privateDb}
            publicDbReady={props.publicDbReady}
            publishDap={publishDap}
          />
        </Block>
      )}
      <Block>
        {/* <input value={text} onChange={(e) => onChangeText(e.target.value)}></input>
                <button onClick={publishMessage}>send</button> */}

        {!showSearchInput && (
          <List dividersIos simpleList>
            {JSON.parse(daps).map((message: any, index: any) => (
              <ListItem key={`${message.timetoken}:${message.publisher}`}>
                {JSON.parse(message.message)["message"]}
              </ListItem>
            ))}
          </List>
        )}
      </Block>
    </Page>
  );
};

export default Main;
