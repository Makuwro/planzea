import React, { ComponentPropsWithoutRef } from "react";

export type IconName = "add" | "arrow_downward" | "arrow_upward" | "arrow_back_ios" | "close" | "delete" | "delete_forever" | "done" | "download" | "edit" | "edit_off" | "expand_less" | "expand_more" | "folder" | "home" | "info" | "label" | "search" | "star" | "star_border" | "more_horiz" | "more_vert" | "settings" | "warning";

export default function Icon({name, ...props}: {name: IconName} & ComponentPropsWithoutRef<"section">) {

  return (
    <span className="material-icons" {...props}>
      {name}
    </span>
  );

}