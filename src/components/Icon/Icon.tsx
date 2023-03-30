import React, { ComponentPropsWithoutRef } from "react";

export default function Icon({name, ...props}: {name: "add" | "arrow_back_ios" | "close" | "done" | "expand_more"} & ComponentPropsWithoutRef<"section">) {

  return (
    <span className="material-icons-round" {...props}>
      {name}
    </span>
  );

}