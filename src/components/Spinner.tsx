import "./Spinner.css";

const Spinner = (props: any) => {
  return props.show && <div className="irl-spinner"></div>;
};

export default Spinner;
