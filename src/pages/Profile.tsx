import { Page, Navbar, Link } from "framework7-react"

const Profile = (props: any) => (
    <Page name="profile">
        <Navbar title="Profile" />
        <div>{props.profileId}</div>
    </Page>
)

export default Profile;