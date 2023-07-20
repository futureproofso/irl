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

const CHANNEL = "tv_ribc";

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
        channels: [CHANNEL],
        count: 50,
        includeMessageType: true,
        includeUUID: true,
        includeMeta: true,
        includeMessageActions: false,
      });
      if (result.channels[CHANNEL]) {
        const oldMessages = (result.channels[CHANNEL] as Array<any>).reverse();
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
    pubnub.subscribe({ channels: [CHANNEL] });
    return () => pubnub.unsubscribe({ channels: [CHANNEL] });
  }

  function createListener() {
    return {
      status: (e: any) => {
        if (e.category === "PNConnectedCategory") {
          console.log("Connected to pubsub channel", CHANNEL);
        }
      },
      message: (e: any) => {
        setMessages((messages) => {
          return JSON.stringify([e, ...JSON.parse(messages)]);
        });
      },
      presence: (presenceEvent: any) => {
        // handle presence
      },
    };
  }

  async function publishMessage(e: any) {
    e.preventDefault();
    if (!text) return;
    const payload = {
      channel: CHANNEL,
      message: {
        title: "post",
        description: text,
      },
    };
    await pubnub.publish(payload);
    onChangeText("");
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
            space={CHANNEL}
            userAddress={props.userAddress}
            privateDb={props.privateDb}
            publicDb={props.publicDb}
            privateDbReady={props.privateDbReady}
          />
          <div onClick={toggleSearchInput}>
            <Plus />
          </div>
        </NavRight>
      </Navbar>
      {showSearchInput && (
        <Block>
          <SearchInput space={CHANNEL} publicDb={props.publicDb} privateDb={props.privateDb} publicDbReady={props.publicDbReady} />
        </Block>
      )}
      <Block>
        {/* <input value={text} onChange={(e) => onChangeText(e.target.value)}></input>
                <button onClick={publishMessage}>send</button> */}

        {!showSearchInput && <List dividersIos simpleList>
          {JSON.parse(messages).map((message: any, index: any) => (
            <ListItem key={`${message.timetoken}:${message.publisher}`}>
              {message.message.description}
            </ListItem>
          ))}
        </List>
}
      </Block>
    </Page>
  );
};

export default Main;
