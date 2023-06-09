import React, { ComponentPropsWithoutRef } from "react";

export default function Icon({name, ...props}: {name: "label" | "add" | "arrow_back_ios" | "close" | "done" | "download" | "expand_less" | "expand_more" | "delete_forever" | "star" | "star_border" | "more_horiz" | "more_vert" | "settings" | "warning"} & ComponentPropsWithoutRef<"section">) {

  return (
    <span className="material-icons" {...props}>
      {name}
    </span>
  );

}