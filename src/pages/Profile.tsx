import { Block, BlockTitle, Page, Popup, Navbar, NavRight, NavTitle, Link, List, Input, ListInput } from "framework7-react"
import { useEffect, useState } from "react"
import '../styles/Profile.css';
import placeholderImage from "../images/avatar_placeholder.png";

const Profile = (props: any) => {
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({});
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

    useEffect(loadProfileFromDb, []);

    function loadProfileFromDb() {
    }

    const uploadImage = (e: any) => {
        e.preventDefault();
        const reader = new FileReader();
        const file = e.target.files[0];
        reader.onloadend = () => {
            setImageFile(file);
            setImageUrl(String(reader.result));
        }
        reader.readAsDataURL(file);
    }

    const toggleEditing = (e: any) => {
        e.preventDefault();
        setIsEditing(!isEditing);
    }

    async function handleSubmit() {
        setLoading(true);
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
                    <div className="irl-profile-img-wrap" >
                        <img src={imageUrl} />
                    </div>
                </label>
                <input id="photo-upload" type="file" onChange={uploadImage} />
                <List>
                    <ListInput
                        className="irl-profile-name"
                        onChange={(e: any) => setName(e.target.value)}
                        value={name}
                        placeholder="your name"
                    />
                    <ListInput className="irl-profile-handle"
                        onChange={(e: any) => setHandle(e.target.value)}
                        value={handle}
                        placeholder="@pickahandle"
                    />
                    <ListInput
                        className="irl-profile-link"
                        placeholder="telegram"
                        onChange={(e: any) => setTelegram(e.target.value)}
                        value={telegram}
                    />
                    <ListInput
                        className="irl-profile-link"
                        placeholder="phone"
                        onChange={(e: any) => setPhone(e.target.value)}
                        value={phone}
                    />
                    <ListInput
                        className="irl-profile-link"
                        placeholder="email"
                        onChange={(e: any) => setEmail(e.target.value)}
                        value={email}
                    />
                    <ListInput
                        className="irl-profile-link"
                        placeholder="linkedin"
                        onChange={(e: any) => setLinkedin(e.target.value)}
                        value={linkedin}
                    />
                    <ListInput
                        className="irl-profile-link"
                        placeholder="twitter"
                        onChange={(e: any) => setTwitter(e.target.value)}
                        value={twitter}
                    />
                    <ListInput
                        className="irl-profile-link"
                        placeholder="instagram"
                        onChange={(e: any) => setInstagram(e.target.value)}
                        value={instagram}
                    />
                </List>
                <div className="irl-profile-save" onClick={handleSubmit}>Save</div>
            </form>
        )
    }

    function renderViewMode() {
        return (
            <form onSubmit={toggleEditing}>
                <label className="custom-file-upload">
                    <div className="irl-profile-img-wrap" >
                        {props.imageUrl && <img src={imageUrl} />}
                        {!props.imageUrl && <svg viewBox="64 64 896 896" focusable="false" data-icon="user" fill="currentColor" aria-hidden="true"><path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path></svg>}
                    </div>
                </label>
                <div className="irl-profile-name">{name}</div>
                <div className="irl-profile-handle">{handle}</div>
                <div className="irl-profile-link">{linkedin}</div>
                <div className="irl-profile-link">{email}</div>
                <div className="irl-profile-link">{phone}</div>
                <div className="irl-profile-link">{twitter}</div>
                <div className="irl-profile-link">{instagram}</div>
                <button type="submit" className="edit">Edit Profile</button>
            </form>
        )
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
                        <Link onClick={props.close}>X</Link>
                    </NavRight>
                </Navbar>
                <Block>
                    <div className="irl-profile-container">
                        {renderProfile()}
                    </div>
                </Block>
            </Page>
        </Popup>
    )
}





export default Profile;