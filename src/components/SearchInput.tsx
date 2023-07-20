import { useEffect, useState } from "react";
import "./SearchInput.css";
const { Search } = require("framework7-icons/react");

const SearchInput = () => {
    const [text, setText] = useState("");

    function handleChange(e: any) {
        e.preventDefault();
        setText(e.target.value);
    }

    function handleClick(e: any) {
        e.preventDefault();
    }

    return (
        <div id="irl-search-container">
        <div id="irl-search-input">
            <input value={text} onChange={handleChange}   />
        </div>
<span onClick={handleClick}>
                <Search />
            </span>
</div>
    )
}

export default SearchInput;
