import {
    Block,
    BlockTitle,
    ListItem,
    Link,
    List,
    Navbar, NavLeft, NavRight, Page,
    Searchbar,
    Toolbar
} from 'framework7-react';
import { useEffect, useMemo, useState } from 'react';
import ProfileButton from '../components/ProfileButton';
import "./Main.css";
import AddButton from '../components/AddButton';
import SearchInput from '../components/SearchInput';
const PubNub = require('pubnub');
const { Plus } = require("framework7-icons/react")

const CHANNEL = "tv_ribc";

const Main = (props: any) => {
    const pubnub = useMemo(
        () => new PubNub({
            publishKey: process.env.REACT_APP_PUBNUB_PUBLISH_KEY,
            subscribeKey: process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY,
            userId: props.userId,
            ssl: process.env.NODE_ENV == "production"
        }), [props.userId])

    const [messages, setMessages] = useState("[]");
    const [text, onChangeText] = useState("");
    const [showSearchInput, setShowSearchInput] = useState(false);

    useEffect(fetchHistoricalMessages, [pubnub])
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
            })
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
                setMessages(messages => {
                    return JSON.stringify([e, ...JSON.parse(messages)])
                });
            },
            presence: (presenceEvent: any) => {
                // handle presence
            }
        };
    }

    async function publishMessage(e: any) {
        e.preventDefault();
        if (!text) return;
        const payload = {
            channel: CHANNEL,
            message: {
                title: "post",
                description: text
            }
        };
        await pubnub.publish(payload);
        onChangeText("");
    }

    function toggleSearchInput(e: any) {
        e.preventDefault();
        setShowSearchInput(!showSearchInput);
    }

    return (
        <Page infinite infiniteDistance={50} infinitePreloader={false} onInfinite={() => { }} hideToolbarOnScroll={true}>
            <Navbar large>
                <NavLeft className="irl-header">
                    irl.so

                </NavLeft>
                <NavRight className="irl-header">
                    <ProfileButton />
                    <span className="arrow-down-close" onClick={toggleSearchInput}>
                        <Plus />
                        </span>
                </NavRight>

            </Navbar>
            {showSearchInput && <Block>
                <SearchInput />
        </Block>}
            <Block>
                {/* <input value={text} onChange={(e) => onChangeText(e.target.value)}></input>
                <button onClick={publishMessage}>send</button> */}

                <List dividersIos simpleList>
                    {JSON.parse(messages).map((message: any, index: any) => (
                        <ListItem key={`${message.timetoken}:${message.publisher}`}>{message.message.description}</ListItem>
                    ))}
                </List>
            </Block>
        </Page>
    )
}

export default Main;