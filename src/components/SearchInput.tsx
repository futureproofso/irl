import { useEffect, useState } from "react";
import { PrivateDatabase } from "../db/private";
import { PublicDatabase } from "../db/public";
import ProfileFrozen from "../pages/ProfileFrozen";
import "./SearchInput.scss";
import Spinner from "./Spinner";

const { Search } = require("framework7-icons/react");

interface Props {
  space: string;
  publicDb: PublicDatabase;
  privateDb: PrivateDatabase;
  publicDbReady: boolean;
}

const SearchInput = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [handle, setHandle] = useState("");
  const [profile, setProfile] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  function handleChange(e: any) {
    e.preventDefault();
    if (e.target.value && e.target.value !== "") {
      setHandle((e.target.value as string).toLowerCase());
    }
    if (notFound) setNotFound(false);
  }

  async function handleClick(e: any) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const userAddress = await props.privateDb.getRemoteAddress(handle);
    if (userAddress) {
      const userProfile = await props.privateDb.getRemoteProfile(userAddress);
      if (userProfile) {
        setProfile(userProfile);
        setShowProfile(true);
      } else {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }

  function closeProfile() {
    setShowProfile(false);
  }

  return (
    <div>
      {profile && (
        <ProfileFrozen
          space={props.space}
          handle={handle}
          opened={showProfile}
          close={closeProfile}
          profileData={profile}
          publicDb={props.publicDb}
          publicDbReady={props.publicDbReady}
        />
      )}
      <fieldset className="field-container">
        <input
          type="text"
          placeholder="add a fren"
          className="field"
          onChange={handleChange}
        />
        <div className="icons-container">
        </div>
        {notFound && `¯\\_(ツ)_/¯`}
        {!notFound && (<div className="irl-search-link" onClick={handleClick}>
          {loading && <Spinner show={true} />}
          {!loading && "Link"}
        </div>)}
      </fieldset>
    </div>
  );
};

export default SearchInput;
