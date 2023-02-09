import React from "react";

export default function DocumentToolbarSection({name, children}: {name: string, children: ReactNode}) {

  return (
    <section>
      <ul>
        {children}
      </ul>
      <section>
        {name}
      </section>
    </section>
  );

}