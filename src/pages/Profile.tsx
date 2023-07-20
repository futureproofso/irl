import { useEffect, useState } from "react";
import {
  Block,
  Link,
  List,
  ListInput,
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
  space: string;
  opened: boolean;
  close: any;
  privateDb: PrivateDatabase;
  privateDbReady: boolean;
  publicDb: PublicDatabase;
  userAddress: string;
  onSave: (profileData: string) => Promise<void>;
}

const Profile = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState();
  const [imageUrl, setImageUrl] = useState(placeholderImage);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [telegram, setTelegram] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(loadProfileFromDb, [props.privateDb, props.privateDbReady]);

  function loadProfileFromDb() {
    setLoading(true);
    async function loadData() {
      const data = await (props.privateDb as PrivateDatabase).getProfile();
      if (data) {
        const profile = JSON.parse(data);
        profile.imageUrl && setImageUrl(profile.imageUrl);
        profile.name && setName(profile.name);
        profile.handle && setHandle(profile.handle.toLowerCase());
        profile.telegram && setTelegram(profile.telegram);
        profile.phone && setPhone(profile.phone);
        profile.email && setEmail(profile.email);
        profile.linkedin && setLinkedin(profile.linkedin);
        profile.twitter && setTwitter(profile.twitter);
        profile.instagram && setInstagram(profile.instagram);
      }
      setLoading(false);
    }
    if (props.privateDbReady) {
      loadData();
    }
  }

  const uploadImage = (e: any) => {
    e.preventDefault();
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      setImageFile(file);
      setImageUrl(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const toggleEditing = (e: any) => {
    e.preventDefault();
    setIsEditing(!isEditing);
  };

  async function handleSubmit() {
    if (loading) return;
    if (!handle) return;
    if (handle == "") return;
    setLoading(true);
    const profileData = {
      imageUrl,
      name,
      handle: handle.toLowerCase(),
      telegram,
      phone,
      email,
      linkedin,
      twitter,
      instagram,
    };
    await props.privateDb.saveProfile(JSON.stringify(profileData));
    // await props.publicDb.publishHandle({
    //   space: props.space,
    //   userAddress: props.userAddress,
    //   handle,
    // });
    // await props.publicDb.publishProfile({
    //   space: props.space,
    //   userAddress: props.userAddress,
    //   profileData: JSON.stringify(profileData),
    // });
    await props.onSave(JSON.stringify(profileData));
    setIsEditing(false);
    setLoading(false);
  }

  function renderProfile() {
    if (isEditing) {
      return renderEditMode();
    } else {
      return renderViewMode();
    }
  }

  function renderEditMode() {
    return (
      <form onSubmit={toggleEditing}>
        <label htmlFor="photo-upload" className="custom-file-upload">
          <div className="irl-profile-img-wrap">
            <img src={imageUrl} />
          </div>
        </label>
        <input id="photo-upload" type="file" onChange={uploadImage} />
        <ListInput
          className="irl-profile-name-input"
          onChange={(e: any) => setName(e.target.value)}
          value={name}
          placeholder="your name"
        />
        <ListInput
          className="irl-profile-handle-input"
          onChange={(e: any) => setHandle(e.target.value)}
          value={handle}
          placeholder="@pickahandle"
        />
        <List>
          <ListInput
            className="irl-profile-link-input"
            placeholder="telegram"
            onChange={(e: any) => setTelegram(e.target.value)}
            value={telegram}
          />
          <ListInput
            className="irl-profile-link-input"
            placeholder="phone"
            onChange={(e: any) => setPhone(e.target.value)}
            value={phone}
          />
          <ListInput
            className="irl-profile-link-input"
            placeholder="email"
            onChange={(e: any) => setEmail(e.target.value)}
            value={email}
          />
          <ListInput
            className="irl-profile-link-input"
            placeholder="linkedin"
            onChange={(e: any) => setLinkedin(e.target.value)}
            value={linkedin}
          />
          <ListInput
            className="irl-profile-link-input"
            placeholder="twitter"
            onChange={(e: any) => setTwitter(e.target.value)}
            value={twitter}
          />
          <ListInput
            className="irl-profile-link-input"
            placeholder="instagram"
            onChange={(e: any) => setInstagram(e.target.value)}
            value={instagram}
          />
        </List>
        <div className="irl-profile-save" onClick={handleSubmit}>
          {loading && <Spinner show={true} />}
          {!loading && "Save"}
        </div>
      </form>
    );
  }

  function renderViewMode() {
    return (
      <form onSubmit={toggleEditing}>
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
        <div className="irl-profile-edit" onClick={toggleEditing}>
          {loading && <Spinner show={true} />}
          {!loading && "Edit"}
        </div>
      </form>
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
            <Link onClick={props.close}>Done</Link>
          </NavRight>
        </Navbar>
        <Block>
          <div className="irl-profile-container">{renderProfile()}</div>
        </Block>
      </Page>
    </Popup>
  );
};

export default Profile;
