import { Block, Page, Popup, Navbar, NavRight, NavTitle, Link } from "framework7-react"
import { useEffect, useState } from "react";

const Info = (props: any) => {
  const [iOSStandalone, setIOSStandalone] = useState<any>("");

  useEffect(() => {
    console.log(window.location)
    if (("standalone" in window.navigator)) {
      setIOSStandalone(window.navigator.standalone);
    }
  }, [])

    return (
        <Popup
        opened={props.opened}
        onPopupClosed={props.close}
        backdrop
        closeByBackdropClick
        push
      >
        <Page name="info">
<Navbar>
          <NavRight>
            <Link onClick={props.close}>X</Link>
          </NavRight>
        </Navbar>
        <Block>
            <p>display-mode matches standalone: {window.matchMedia('(display-mode: standalone)').matches}</p>
            <p>window location search: {window.location.search}</p>
            <p>ios standalone: {iOSStandalone}</p>
    </Block>
        </Page>
        </Popup>
    )
}

export default Info;