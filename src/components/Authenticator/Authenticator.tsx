import React, { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import Icon from "../Icon/Icon";

export default function Authenticator({isOpen, onClose}: {isOpen: boolean, onClose: () => void}) {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  useEffect(() => {

    (async () => {

      if (isSubmitting) {

        try {

          if (isRegistering) {

            // Create the account.
            await fetch("https://localhost:3001/account", {
              method: "POST",
              headers: {
                email,
                password
              }
            });

          } 

          // Request a session token.
          const response = await fetch("https://localhost:3001/account/session", {
            method: "POST",
            headers: {
              email,
              password
            }
          });

          // Save the account token in a cookie.
          const session = await response.json();
          document.cookie = `token=${session.token}`;

          // Refresh.
          window.location.reload();

        } catch (err) {

          alert(err);

        }

        setIsSubmitting(false);

      }

    })();

  }, [isSubmitting]);

  return (
    <Popup isOpen={isOpen}>
      <section>
        <button onClick={onClose}>
          <Icon name="arrow_back_ios" />
        </button>
      </section>
      <h1>{isRegistering ? "Register for a" : "Sign in to your"} Planzea account</h1>
      <form onSubmit={(event) => {

        event.preventDefault();
        setIsSubmitting(true);
      
      }}>
        <section>
          <label>Email address</label>
          <input type="text" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSubmitting} required />
        </section>
        <section>
          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} required />
        </section>
        <input type="submit" disabled={isSubmitting} />
      </form>
      {
        isRegistering ? <p>Already have an account? <button onClick={() => setIsRegistering(false)}>Sign in</button></p> : <p>Don't have an account? <button onClick={() => setIsRegistering(true)}>Register</button></p>
      }
    </Popup>
  );

}