import { App, View, Page, Navbar, Toolbar, Link } from 'framework7-react';

import Home from "./pages/Home";
import Ping from "./pages/Ping";
import Profile from './pages/Profile';
import NavBottom from './components/NavBottom';

const f7params = {
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
  theme: "auto"
}

export default () => (
    <App {...f7params}>
      <View main url="/">
      </View>
  </App>
  );
