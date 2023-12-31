import { useEffect, useMemo, useState } from "react";
import { Link, Navbar, Page, Toolbar } from "framework7-react";
import NavTop from "../components/NavTop";

const Ping = ({ f7route }: any) => {
  const worker: Worker = useMemo(
    () => new Worker(new URL("../workers/ping.ts", import.meta.url)),
    [],
  );

  const [message, setMessage] = useState<String>("");

  useEffect(() => {
    if (window.Worker) {
      worker.postMessage("ping");
    }
  }, [worker]);

  useEffect(() => {
    if (window.Worker) {
      worker.onmessage = (e: MessageEvent<string>) => {
        setMessage(e.data);
      };
    }
  }, [worker]);

  return (
    <Page name="ping">
      <div>{message}</div>
    </Page>
  );
};

export default Ping;
