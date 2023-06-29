import React from "react";
import HeaderOptions from "../HeaderOptions/HeaderOptions";
import { useNavigate } from "react-router-dom";
import Icon from "../Icon/Icon";

export default function ProjectHeaderOptions() {

  const navigate = useNavigate();

  return (
    <HeaderOptions>
      <button className="singlePixelBorder" onClick={() => navigate("?create=project", {replace: true})}>
        <Icon name="add" />
      </button>
    </HeaderOptions>
  );

}