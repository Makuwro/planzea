import React from "react";
import Popup from "../Popup/Popup";
import FormSection from "../FormSection/FormSection";

export default function ProjectCreationPopup() {

  return (
    <Popup name="Create a project" onClose={() => undefined}>
      <p>A project serves as a container for all of your tasks.</p>
      <form>
        <FormSection name="Project owner" hint="This is the account that has full access over your project.">

        </FormSection>
        <FormSection name="Project name">
          <input type="text" />
        </FormSection>
      </form>
    </Popup>
  );

}