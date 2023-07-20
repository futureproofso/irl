import { useEffect, useState } from "react";
import { Fab, FabButtons, Icon } from "framework7-react";
import { PrivateDatabase } from "../db/private";
import { PublicDatabase } from "../db/public";
import Profile from "../pages/Profile";

const { Person } = require("framework7-icons/react");

interface Props {
  space: string;
  userAddress: string;
  privateDb: PrivateDatabase;
  privateDbReady: boolean;
  publicDb: PublicDatabase;
}

const ProfileButton = (props: Props) => {
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
      <Profile
        space={props.space}
        userAddress={props.userAddress}
        opened={showProfile}
        close={closeProfile}
        privateDb={props.privateDb}
        publicDb={props.publicDb}
        privateDbReady={props.privateDbReady}
      />
    </div>
  );
};

export default ProfileButton;
