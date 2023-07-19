export const ProfileImageUpload = (props: any) => {
    return (
    <label htmlFor="photo-upload" className="custom-file-upload fas">
        <div className="img-wrap img-upload" >
            <img src={props.src} />
        </div>
        <input id="photo-upload" type="file" onChange={props.onChange} />
    </label>)
}