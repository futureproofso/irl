import { Block, BlockTitle, Page, Popup, Navbar, NavRight, NavTitle, Link } from "framework7-react"
import { useState } from "react"
import safari1 from "../images/safari1.png";
import safari2 from "../images/safari2.png";
import safari3 from "../images/safari3.png";
import '../styles/Profile.css';

const InstallInstructions = (props: any) => {
    return (
        <Popup
            opened={props.opened}
            onPopupClosed={props.close}
            backdrop
            closeByBackdropClick
            push
        >
            <Page name="installInstructions">
                <Navbar>
                    <NavRight>
                        <Link onClick={props.close}>Close</Link>
                    </NavRight>
                    <NavTitle>How do I install the app?</NavTitle>
                </Navbar>
                <Block>
                    <BlockTitle>On an iPhone</BlockTitle>
                    <div>
                        Go to irl.so in Safari.<br/>
                        Tap the share button at the bottom.<br/>
                        Scroll down a bit and tap "Add to Home Screen".<br/>
                        Tap "Add" in the top right.
                    </div>
                <div className="grid grid-cols-3 grid-gap">
                <img
              slot="media"
              src={safari1}
              width="48"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
            <img
              slot="media"
              src={safari2}
              width="48"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
            <img
              slot="media"
              src={safari3}
              width="48"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
                    </div>
                </Block>
                <Block>
                    <BlockTitle>On an Android</BlockTitle>
                    <div>
                        Go to irl.so in Chrome.<br/>
                        Tap the three dots in the top right.<br/>
                        Tap "Add to Home Screen".<br/>
                        Tap "Add".
                    </div>
                </Block>
            </Page>
        </Popup>
    )
}

export default InstallInstructions;