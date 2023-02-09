import React from "react";

export default function DocumentToolbarCategoryButton({children}: {children: ReactNode}) {

  return (
    <li>
      <button>
        {children}
      </button>
    </li>
  );

}