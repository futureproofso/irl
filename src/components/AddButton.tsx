import { useEffect, useState } from "react";
import { Fab, FabButtons, Icon, Searchbar } from "framework7-react";
import Profile from "../pages/Profile";
import SearchInput from "./SearchInput";

const { Plus } = require("framework7-icons/react");

const AddButton = (props: any) => {
  return (
    <div>
      <span onClick={(e: any) => props.onClick(e)}>
        <Plus />
      </span>
    </div>
  );
};

export default AddButton;
