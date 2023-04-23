import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import styles from "./Exporter.module.css";
import Client from "../../client/Client";
import Authenticator from "../Authenticator/Authenticator";
import Icon from "../Icon/Icon";

export default function Exporter({client, isOpen, onClose}: {client: Client, isOpen: boolean, onClose: () => void}) {

  const [foundDevices, setFoundDevices] = useState<{id: string, name: string}[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<{id: string, name: string} | null>(null);
  const [isRequestAccepted, setIsRequestAccepted] = useState<boolean>(false);
  const [deviceName, setDeviceName] = useState<string>("...");
  const [ws, setWS] = useState<WebSocket | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {

    const getCookie = (name: string) => document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))?.at(2);
    const token = getCookie("token");
    setToken(token ?? null);

    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      
      console.log("Connected to the server!");

      setWS(ws);

      ws.send(JSON.stringify({
        type: "Authenticate",
        token
      }));
      
    };

    ws.onmessage = async (event) => {

      try {

        if (event.data instanceof Blob) {

          await client.import(event.data);
          window.location.reload();

        } else if (typeof event.data === "string") {

          // Try to parse the data.
          const data = JSON.parse(event.data);

          switch (data.type) {

            case "NameSet":
              setDeviceName(data.name);
              break;

            case "DeviceJoin":
              setFoundDevices([...foundDevices, {id: data.id, name: data.name}]);
              break;
            
            case "RequestAccept":
              setIsRequestAccepted(true);
              break;

            case "DeviceLeave":
              setFoundDevices(foundDevices.filter((device) => device.id !== data.id));
              if (selectedDevice?.id === data.id) {

                setSelectedDevice(null);

              }
              break;

            default:
              break;

          }

        }

      } catch (err) {



      }

    };

    setReady(true);

    return () => {

      ws.close();

    };


  }, []);

  return ready ? (
    token ? (
      <Popup isOpen={isOpen} className={styles.main}>
        <section>
          <button onClick={onClose}>
            <Icon name="arrow_back_ios" />
          </button>
        </section>
        {
          selectedDevice ? (
            isRequestAccepted ? (
              <section>
                <h1>Export data from this device to your other browser</h1>
                <p>If you press this button on your other browser, your data on this browser will be overwritten.</p>
                <button onClick={async () => ws?.send(await client.export())}>Export data</button>
              </section>
            ) : (
              <section>
                <h1>Waiting for {selectedDevice.name} to select you...</h1>
                <p>Go on your other browser and select <b>{deviceName}</b> to continue. Importing doesn't work in Firefox's incognito mode.</p>
                <button>Cancel</button>
              </section>
            )
          ) : (
            <section>
              <section>
                <p>Sign in to your other browser and search for <b>{deviceName}</b>.</p>
                <p>We'll also look for some browser on this account. We'll let you know if we find any.</p>
              </section>
              {foundDevices[0] ? (
                <section>
                  <label>Found devices</label>
                  <ul>
                    {foundDevices.map((device) => (
                      <li key={device.id}>
                        <button onClick={() => {
                          
                          setSelectedDevice({id: device.id, name: device.name});
                          ws?.send(JSON.stringify({
                            type: "DeviceSelect",
                            id: device.id
                          }));
      
                        }}>{device.name}</button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <section>
                <p>Wrong account? <button onClick={() => {
                  
                  document.cookie = "token=";
                  window.location.reload();
                
                }}>Sign out</button></p>
              </section>
            </section>
          )
        }
      </Popup>
    ) : <Authenticator isOpen={isOpen} onClose={onClose} />
  ) : null;

}