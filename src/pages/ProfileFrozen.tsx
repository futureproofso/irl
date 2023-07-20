import { useEffect, useState } from "react";
import {
  Block,
  BlockTitle,
  Link,
  List,
  NavRight,
  Navbar,
  Page,
  Popup,
} from "framework7-react";
import Spinner from "../components/Spinner";
import { PrivateDatabase } from "../db/private";
import { PublicDatabase } from "../db/public";
import placeholderImage from "../images/avatar_placeholder.png";
import "../styles/Profile.css";

interface Props {
  opened: boolean;
  close: any;
  publicDb: PublicDatabase;
  publicDbReady: boolean;
  profileData?: string;
  space: string;
  handle: string;
}

const ProfileFrozen = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [imageUrl, setImageUrl] = useState(placeholderImage);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [telegram, setTelegram] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");

  useEffect(loadProfile, [props.publicDb, props.publicDbReady]);

  function loadProfile() {
    setLoading(true);
    let profileData = props.profileData;

    if (profileData) {
      parseProfileData(profileData);
      setLoading(false);
    } else {
      if (props.publicDbReady) {
        loadProfileFromDb().then(() => {
          setLoading(false);
        });
      }
    }

    async function loadProfileFromDb(): Promise<any> {
      const userAddress = await props.publicDb.getUserAddress({
        space: props.space,
        handle: props.handle,
      });
      if (userAddress) {
        const data = await props.publicDb.getProfile({
          space: props.space,
          userAddress,
        });
        if (data) {
          parseProfileData(data);
        }
      }
    }

    function parseProfileData(data: string) {
      const profile = JSON.parse(data);
      profile.imageUrl && setImageUrl(profile.imageUrl);
      profile.name && setName(profile.name);
      profile.handle && setHandle(profile.handle);
      profile.telegram && setTelegram(profile.telegram);
      profile.phone && setPhone(profile.phone);
      profile.email && setEmail(profile.email);
      profile.linkedin && setLinkedin(profile.linkedin);
      profile.twitter && setTwitter(profile.twitter);
      profile.instagram && setInstagram(profile.instagram);
    }
  }

  function renderProfile() {
    return renderViewMode();
  }

  function renderViewMode() {
    return (
      <div>
        <label className="custom-file-upload">
          <div className="irl-profile-img-wrap">
            <img src={imageUrl} />
          </div>
        </label>
        <div className="irl-profile-name">{name}</div>
        <div className="irl-profile-handle">{handle}</div>
        <List>
          {telegram && <div className="irl-profile-link">{telegram}</div>}
          {phone && <div className="irl-profile-link">{phone}</div>}
          {email && <div className="irl-profile-link">{email}</div>}
          {linkedin && <div className="irl-profile-link">{linkedin}</div>}
          {twitter && <div className="irl-profile-link">{twitter}</div>}
          {instagram && <div className="irl-profile-link">{instagram}</div>}
        </List>
      </div>
    );
  }

  return (
    <Popup
      opened={props.opened}
      onPopupClosed={props.close}
      backdrop
      closeByBackdropClick
      push
    >
      <Page name="profile">
        <Navbar>
          <NavRight>
            <Link onClick={props.close}>Close</Link>
          </NavRight>
        </Navbar>
        <Block>
          <div className="irl-profile-container">{renderProfile()}</div>
        </Block>
      </Page>
    </Popup>
  );
};

export default ProfileFrozen;
