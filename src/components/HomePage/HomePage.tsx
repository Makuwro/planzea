import React from "react";
import Client from "../../client/Client";

export default function HomePage({client}: {client: Client}) {

  async function createProject() {

  }

  return (
    <main>
      <h1>Projects</h1>
      <section>
        <p>You don't have any projects yet. Want to change that?</p>
        <button onClick={createProject}>Create project</button>
      </section>
    </main>
  );

}