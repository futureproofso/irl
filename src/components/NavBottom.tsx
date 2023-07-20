import { Toolbar, Link } from "framework7-react";
import { Component } from "react";

const NavBottom = () => {
  return (
    <Toolbar tabbar icons bottom>
      <Link
        tabLink="#tab-1"
        tabLinkActive
        text="Tab 1"
        iconIos="f7:envelope_fill"
        iconMd="material:email"
      />
      <Link
        href="/ping/"
        tabLink="#ping"
        text="Ping"
        iconIos="f7:calendar_fill"
        iconMd="material:today"
      />
      <Link
        tabLink="#tab-3"
        text="Tab 3"
        iconIos="f7:cloud_upload_fill"
        iconMd="material:file_upload"
      />
    </Toolbar>
  );
};

export default NavBottom;
