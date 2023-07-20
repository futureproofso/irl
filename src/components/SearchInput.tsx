import { useEffect, useState } from "react";
import { PrivateDatabase } from "../db/private";
import { PublicDatabase } from "../db/public";
import ProfileFrozen from "../pages/ProfileFrozen";
import "./SearchInput.scss";
import Spinner from "./Spinner";

const { Search } = require("framework7-icons/react");

interface Props {
  userHandle: string;
  userAddress: string;
  space: string;
  publicDb: PublicDatabase;
  privateDb: PrivateDatabase;
  publicDbReady: boolean;
  publishDap: any;
}

const phrases = [
  (a: string, b: string) => `congrats ${a} and ${b}! you have dapped!`,
  (a: string, b: string) => `${a} and ${b} have dapeth`,
  (a: string, b: string) => `${a} dapped up ${b}`,
  (a: string, b: string) => `a wild dap appeared between ${a} and ${b}`,
  (a: string, b: string) => `congrats on the dap ${a} and ${b}!`,
  (a: string, b: string) => `${a} and ${b} have dapped, irl!`,
  (a: string, b: string) => `${a} and ${b} dapped up. what's your excuse??`,
  (a: string, b: string) => `new dap between ${a} and ${b}`,
  (a: string, b: string) => `dap's what's up ${a} and ${b} (ha...)`,
  (a: string, b: string) => `${a} dapped ${b}`,
  (a: string, b: string) => `${a} and ${b} dapped up irl`,
  (a: string, b: string) => `${a} and ${b} dapped up`,
  (a: string, b: string) => `${a} gave ${b} a dap`,
  (a: string, b: string) => `look at ${a} and ${b} dapping`,
];

const SearchInput = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [remoteHandle, setRemoteHandle] = useState("");
  const [remoteProfile, setRemoteProfile] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  function handleChange(e: any) {
    e.preventDefault();
    if (e.target.value && e.target.value !== "") {
      setRemoteHandle((e.target.value as string).toLowerCase());
    }
    if (notFound) setNotFound(false);
  }

  async function handleClick(e: any) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const remoteAddress = await props.privateDb.getRemoteAddress(remoteHandle);
    if (remoteAddress) {
      const remoteProfile = await props.privateDb.getRemoteProfile(
        remoteAddress,
      );
      if (remoteProfile) {
        setRemoteProfile(remoteProfile);
        setShowProfile(true);
        const randomPhrase =
          phrases[Math.floor(Math.random() * phrases.length)];
        const message = randomPhrase(props.userHandle, remoteHandle);
        await props.publishDap(
          JSON.stringify({
            start: remoteAddress,
            end: props.userAddress,
            message,
          }),
        );
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
      {remoteProfile && (
        <ProfileFrozen
          space={props.space}
          handle={remoteHandle}
          opened={showProfile}
          close={closeProfile}
          profileData={remoteProfile}
          publicDb={props.publicDb}
          publicDbReady={props.publicDbReady}
        />
      )}
      <fieldset className="field-container">
        <input
          type="text"
          placeholder="handle"
          className="field"
          onChange={handleChange}
        />
        <div className="icons-container"></div>
        {notFound && `¯\\_(ツ)_/¯`}
        {!notFound && (
          <div className="irl-search-link" onClick={handleClick}>
            {loading && <Spinner show={true} />}
            {!loading && "Dap"}
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default SearchInput;
