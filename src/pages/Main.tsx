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
const CHANNEL_PROFILES = `${ADMIN}:${SPACE}:profiles`;
const CHANNEL_DAPS = `${ADMIN}:${SPACE}:daps`;

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

  const [messages, setMessages] = useState("[]");
  const [text, onChangeText] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(fetchHistoricalMessages, [pubnub]);
  useEffect(listenToPubsub, [pubnub]);
  useEffect(subscribeToChannel, [pubnub]);

  function fetchHistoricalMessages() {
    async function getOlderMessages() {
      const result = await pubnub.fetchMessages({
        channels: [CHANNEL_DAPS],
        count: 50,
        includeMessageType: true,
        includeUUID: true,
        includeMeta: true,
        includeMessageActions: false,
      });
      if (result.channels[CHANNEL_DAPS]) {
        const oldMessages = (
          result.channels[CHANNEL_DAPS] as Array<any>
        ).reverse();
        setMessages(JSON.stringify(oldMessages));
      }
    }
    getOlderMessages();
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
        if (e.publisher == props.userAddress) return;
        if (e.channel == CHANNEL_DAPS) {
          setMessages((messages) => {
            return JSON.stringify([e, ...JSON.parse(messages)]);
          });
        }
        if (e.channel == CHANNEL_PROFILES) {
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
    await publishMessage({ channel: CHANNEL_PROFILES, message: profileData });
  }

  async function publishDap(dapData: string) {
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
            space={SPACE}
            publicDb={props.publicDb}
            privateDb={props.privateDb}
            publicDbReady={props.publicDbReady}
          />
        </Block>
      )}
      <Block>
        {/* <input value={text} onChange={(e) => onChangeText(e.target.value)}></input>
                <button onClick={publishMessage}>send</button> */}

        {!showSearchInput && (
          <List dividersIos simpleList>
            {JSON.parse(messages).map((message: any, index: any) => (
              <ListItem key={`${message.timetoken}:${message.publisher}`}>
                {message.message.description}
              </ListItem>
            ))}
          </List>
        )}
      </Block>
    </Page>
  );
};

export default Main;
