import { useEffect, useState } from "react";
import { Fab, FabButtons, Icon } from "framework7-react";
import Profile from "../pages/Profile";

const ProfileButton = () => {
    const [showProfile, setShowProfile] = useState(false);

    function openProfile() {
        setShowProfile(true);
    }

    function closeProfile() {
        setShowProfile(false);
    }

    return (
        <div>
            <Fab position="right-top" slot="fixed" onClick={openProfile}>
                <Icon ios="f7:plus" md="material:add" />
            </Fab>
            <Profile opened={showProfile} close={closeProfile} />
        </div>
    )
}

export default ProfileButton;

