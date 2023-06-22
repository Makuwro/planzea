import React, { ComponentPropsWithoutRef } from "react";

export default function Icon({name, ...props}: {name: "label" | "add" | "arrow_back_ios" | "close" | "delete" | "delete_forever"  | "done" | "download" | "expand_less" | "expand_more" | "home" | "star" | "star_border" | "more_horiz" | "more_vert" | "settings" | "warning"} & ComponentPropsWithoutRef<"section">) {

  return (
    <span className="material-icons" {...props}>
      {name}
    </span>
  );

}