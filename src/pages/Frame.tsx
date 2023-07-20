import { Page, Navbar, Link } from "framework7-react";
import NavTop from "../components/NavTop";
import NavBottom from "../components/NavBottom";

const Frame = (props: any) => (
  <Page name={props.pageName}>
    <NavTop f7route={props.f7route} />
    {props.children}
  </Page>
);

export default Frame;
