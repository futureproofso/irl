import { useEffect, useMemo, useState } from "react";
import { App, Page, View } from "framework7-react";
import { Framework7Parameters } from "framework7/types";
import Home from "./pages/Home";
import InstallInstructions from "./pages/InstallInstructions";
import Main from "./pages/Main";
import Profile from "./pages/Profile";
import BannerScrolling from "./components/BannerScrolling";
import { PrivateDatabase, idbDatabase as privateDatabase } from "./db/private";
import { PublicDatabase, gunDb as publicDatabase } from "./db/public";
import * as ku from "./keyUtils";
import "./styles/App.css";

const f7params: Framework7Parameters = {
  routes: [
    {
      path: "/",
      component: Home,
    },
    {
      path: "/profile/:profileId/",
      component: Profile,
    },
  ],
  name: "irl.so",
  darkMode: true,
};

export default () => {
  const privateDb: PrivateDatabase = useMemo(() => new privateDatabase(), []);
  const publicDb: PublicDatabase = useMemo(() => new publicDatabase(), []);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [privateDbReady, setPrivateDbReady] = useState(false);
  const [publicDbReady, setPublicDbReady] = useState(false);
  const [userAddress, setUserAddress] = useState("temp");
  const [loading, setLoading] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(listenForBeforeInstallPrompt, []);
  useEffect(listenForDOMContentLoaded, []);
  useEffect(detectInstallation, []);
  useEffect(setupPrivateDb, [privateDb]);
  useEffect(setupUserCreds, [privateDbReady]);
  useEffect(setupPublicDb, [publicDb]);

  function listenForBeforeInstallPrompt() {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }

  function handleBeforeInstallPrompt(e: any) {
    console.log("handle before install prompt");
    e.preventDefault();
    setInstallPromptEvent(e);
    setCanInstall(true);
  }

  function listenForDOMContentLoaded() {
    window.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
    return () =>
      window.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
  }

  function handleDOMContentLoaded() {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    // METRICS: display mode
  }

  function detectInstallation() {
    if ("standalone" in window.navigator && window.navigator.standalone) {
      setInstalled(true);
    }
    if (window.location.search === "?d=a") {
      setInstalled(true);
    }
  }

  function setupPrivateDb() {
    privateDb.setup().then(() => {
      setPrivateDbReady(privateDb.setupComplete);
    });
  }

  function setupPublicDb() {
    publicDb.setup().then(() => {
      setPublicDbReady(publicDb.setupComplete);
    });
  }

  function setupUserCreds() {
    async function setupUser() {
      if (privateDbReady) {
        let publicKey = await privateDb.getPublicKey();
        if (!publicKey) {
          const keypair = await ku.generateKeypair();
          publicKey = keypair.publicKey;
          await privateDb.saveKeypair(keypair);
        }
        const address = await ku.publicKeyToAddress(publicKey);
        setUserAddress(address);
      }
    }
    setupUser();
  }

  async function promptInstall() {
    console.log(installPromptEvent);
    if (!installPromptEvent) {
      console.log("install failed :(");
      return;
    }
    const result = await installPromptEvent.prompt();
    console.log(`Install prompt was: ${result.outcome}`);
    setInstallPromptEvent(null);
  }

  function showInstallInstructions() {
    setShowInstructions(true);
  }

  function hideInstallInstructions() {
    setShowInstructions(false);
  }

  return (
    <App {...f7params}>
      <View>
        <Page>
          <InstallInstructions
            opened={showInstructions}
            close={hideInstallInstructions}
          />
          {canInstall && !installed && (
            <BannerScrolling text={"install meeeeee"} onClick={promptInstall} />
          )}
          {!canInstall && !installed && (
            <BannerScrolling
              text={"install with Safari on iOS"}
              onClick={showInstallInstructions}
            />
          )}
          {!canInstall && !installed && (
            <BannerScrolling
              text={"install with Chrome on Android"}
              onClick={showInstallInstructions}
            />
          )}
          {!installed && (
            <Home
              userAddress={userAddress}
              publicDb={publicDb}
              privateDb={privateDb}
            />
          )}
          {installed && (
            <Main
              userAddress={userAddress}
              publicDb={publicDb}
              privateDb={privateDb}
              privateDbReady={privateDbReady}
            />
          )}
        </Page>
      </View>
    </App>
  );
};
