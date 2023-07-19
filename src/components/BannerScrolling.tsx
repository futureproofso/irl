import "./BannerScrolling.css";

const BannerScrolling = (props: any) => {
    function handleClick() {
        props.onClick && props.onClick()
    }
    return (
            <div className="scroll-banner" onClick={handleClick}>
                {Array(6).fill(0).map((v, i) => {
                    return (
                        <span key={i}>{props.text}</span>
                    )
                })}
            </div>
    )
}

export default BannerScrolling;
