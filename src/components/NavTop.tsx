import { Component } from "react";
import { Link, Navbar } from "framework7-react";
import { f7 } from "framework7-react";

const NavTop = (props: any) => {
  return <Navbar title={props.f7route.url} />;
};

export default NavTop;
