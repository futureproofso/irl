import { Link, Navbar, Page } from "framework7-react";
import NavBottom from "../components/NavBottom";
import NavTop from "../components/NavTop";

const Frame = (props: any) => (
  <Page name={props.pageName}>
    <NavTop f7route={props.f7route} />
    {props.children}
  </Page>
);

export default Frame;
