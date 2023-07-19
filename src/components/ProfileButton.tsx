import { useEffect, useState } from "react";
import { Fab, FabButtons, Icon } from "framework7-react";
import Profile from "../pages/Profile";
const { Person } = require("framework7-icons/react");

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
            <span onClick={openProfile}>
                <Person />
            </span>
            <Profile opened={showProfile} close={closeProfile} />
        </div>
    )
}

export default ProfileButton;

