import { Block, BlockTitle, ListItem, Fab, FabButtons, FabButton, Icon, Link, List, Navbar, NavLeft, NavRight, NavTitle, NavTitleLarge, Page, f7 } from 'framework7-react';
import { useEffect, useMemo, useState } from 'react';
import ProfileButton from '../components/ProfileButton';
import "./Main.css";
const PubNub = require('pubnub');

const CHANNEL = "tv_ribc";

const Main = (props: any) => {
    const pubnub = useMemo(
        () => new PubNub({
        publishKey: process.env.PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.PUBNUB_SUBCRIBE_KEY,
        userId: props.userId,
        ssl: process.env.NODE_ENV == "production"
    }), [props.userId])

    const [messages, setMessages] = useState("[]");
    const [text, onChangeText] = useState("");

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

    return (
        <Page infinite infiniteDistance={50} infinitePreloader={false} onInfinite={() => { }}>
            <Navbar large>
                <NavLeft className="irl-header">
                    irl.so
                </NavLeft>
                <NavRight className="irl-header">
                    <ProfileButton />
                </NavRight>
            </Navbar>
            <Block>


                <BlockTitle>Scroll bottom</BlockTitle>

                <input value={text} onChange={(e) => onChangeText(e.target.value)}></input>
                <button onClick={publishMessage}>send</button>
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