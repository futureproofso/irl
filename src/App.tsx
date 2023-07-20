import { App, View, Page, Navbar, Toolbar, Link, f7 } from 'framework7-react';
import { useEffect, useMemo, useState } from 'react';

import Home from "./pages/Home";
import Main from "./pages/Main";
import Ping from "./pages/Ping";
import Profile from './pages/Profile';
import NavBottom from './components/NavBottom';
import { idbDatabase } from "./db";
import * as ku from "./keyUtils";
import { Framework7Parameters } from 'framework7/types';
import InstallationBanner from './components/BannerScrolling';
import BannerScrolling from './components/BannerScrolling';
import ProfileButton from './components/ProfileButton';
import "./styles/App.css";
import InstallInstructions from './pages/InstallInstructions';

const f7params: Framework7Parameters = {
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/profile/:profileId/',
      component: Profile
    }
  ],
  name: "irl.so",
  darkMode: true
}

export default () => {
  const db: idbDatabase = useMemo(
    () => new idbDatabase(),
    []
  );
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [dbSetupComplete, setDbSetupComplete] = useState(false);
  const [userId, setUserId] = useState("temp");
  const [loading, setLoading] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(listenForBeforeInstallPrompt, []);
  useEffect(listenForDOMContentLoaded, []);
  useEffect(detectInstallation, []);

  function listenForBeforeInstallPrompt() {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }

  function handleBeforeInstallPrompt(e: any) {
    console.log("handle before install prompt")
    e.preventDefault();
    setInstallPromptEvent(e);
    setCanInstall(true);
  }

  function listenForDOMContentLoaded() {
    window.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    return () => window.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
  }

  function handleDOMContentLoaded() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }
    // METRICS: display mode
  }

  function detectInstallation() {
    if (("standalone" in window.navigator) && window.navigator.standalone) {
      setInstalled(true);
    }
    if (window.location.search === "?d=a") {
      setInstalled(true);
    }
  }

  useEffect(() => {
    db.setup().then(() => {
      setDbSetupComplete(db.setupComplete);
    })
  }, [db]);

  useEffect(() => {
    async function setupUser() {
      if (dbSetupComplete) {
        let publicKey = await db.getPublicKey();
        if (!publicKey) {
          const keypair = await ku.generateKeypair();
          publicKey = keypair.publicKey;
          await db.saveKeypair(keypair);
        }
        const address = await ku.publicKeyToAddress(publicKey);
        setUserId(address);
      }
    }

    setupUser();

    return () => { }
  }, [dbSetupComplete]);

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
        <InstallInstructions opened={showInstructions} close={hideInstallInstructions} />
      {canInstall && !installed && <BannerScrolling text={"install meeeeee"} onClick={promptInstall} />}
      {!canInstall && !installed && <InstallationBanner text={"install with Safari on iOS"} onClick={showInstallInstructions} />}
      {!canInstall && !installed && <InstallationBanner text={"install with Chrome on Android"} onClick={showInstallInstructions} />}
      {!installed && <Home />}
      {installed && <Main userId={userId} />}
      </Page>
      </View>
    </App>
  )
}
