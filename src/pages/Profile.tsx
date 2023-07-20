import { Block, BlockTitle, Page, Popup, Navbar, NavRight, NavTitle, Link } from "framework7-react"
import { ProfileImageUpload } from "../components/ProfileImageUpload"
import { useState } from "react"
import '../styles/Profile.css';

const Profile = (props: any) => {
    const [imageFile, setImageFile] = useState();
    const [imageUrl, setImageUrl] = useState("https://github.com/OlgaKoplik/CodePen/blob/master/profile.jpg?raw=true");
    const [name, setName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

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

    const editName = (e: any) => {
        const name = e.target.value;
        setName(name);
    }

    const toggleEditing = (e: any) => {
        e.preventDefault();
        setIsEditing(!isEditing);
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

                    <div>{props.profileId}</div>
                    <div>
                        {(isEditing) ? (
                            <EditableProfile onSubmit={toggleEditing}>
                                <ProfileImageUpload onChange={uploadImage} src={imageUrl} />
                                <NameField onChange={editName} value={name} />
                            </EditableProfile>
                        ) : (
                            <ProfileCard
                                onSubmit={toggleEditing}
                                src={imageUrl}
                                name={name}
                            />)}

                    </div>
                </Block>
            </Page>
        </Popup>
    )
}

function NameField(props: any) {
    return (
        <div className="field">
            <label htmlFor="name">
                name:
            </label>
            <input
                id="name"
                type="text"
                onChange={props.onChange}
                maxLength={25}
                value={props.value}
                placeholder="Alexa"
                required />
        </div>
    )
}


function ProfileCard(props: any) {
    return (
        <div className="card">
            <form onSubmit={props.onSubmit}>
                <label className="custom-file-upload fas">
                    <div className="img-wrap" >
                        <img src={props.src} />
                    </div>
                </label>
                <div className="name">{props.name}</div>
                <button type="submit" className="edit">Edit Profile </button>
            </form>
        </div>
    )
}

function EditableProfile(props: any) {
    return (

        <div className="card">
            <form onSubmit={props.onSubmit}>
                {props.children}
                <button type="submit" className="save">Save </button>
            </form>
        </div>
    )
}

export default Profile;