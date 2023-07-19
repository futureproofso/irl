import { App, View, Page, Navbar, Toolbar, Link, f7 } from 'framework7-react';
import { useEffect, useMemo, useState } from 'react';

import Home from "./pages/Home";
import Ping from "./pages/Ping";
import Profile from './pages/Profile';
import NavBottom from './components/NavBottom';
import { idbDatabase } from "./db";
import * as ku from "./keyUtils";
import { Framework7Parameters } from 'framework7/types';
import InstallationBanner from './components/BannerScrolling';
import BannerScrolling from './components/BannerScrolling';

const f7params: Framework7Parameters = {
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/ping/',
      component: Ping
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
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(listenForBeforeInstallPrompt, []);
  useEffect(listenForDOMContentLoaded, []);

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
        // f7.views.main.router.navigate(`/profile/${address}/`);
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

  return (
    <App {...f7params}>
      {canInstall && !installed && <BannerScrolling text={"install meeeeee"} onClick={promptInstall} />}
      {!canInstall && <InstallationBanner text={"install with Safari on iOS"} />}
      {!canInstall && <InstallationBanner text={"install with Chrome on Android"} />}
      <View
      url="/"
      iosDynamicNavbar={false}
      browserHistory={true}>
      </View>
    </App>
  )
}
