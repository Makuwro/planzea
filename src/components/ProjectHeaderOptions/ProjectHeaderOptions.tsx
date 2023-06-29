import React from "react";
import HeaderOptions from "../HeaderOptions/HeaderOptions";
import { useNavigate } from "react-router-dom";
import Icon from "../Icon/Icon";

export default function ProjectHeaderOptions() {

  const navigate = useNavigate();

  return (
    <HeaderOptions>
      <span>
        <button className="singlePixelBorder" onClick={() => navigate("?create=project", {replace: true})}>
          <Icon name="add" />
        </button>
        <button disabled onClick={() => navigate("?delete=project&id=", {replace: true})}>
          <Icon name="delete" />
        </button>
      </span>
    </HeaderOptions>
  );

}