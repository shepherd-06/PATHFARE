import React, { forwardRef } from "react";
import { cn } from "../utils";

const Input = forwardRef((props, ref) => {
  const { className, type, ...rest } = props;

  return (
    <input
      type={type}
      className={cn("form-control", className)} // Bootstrap input class
      ref={ref}
      {...rest}
    />
  );
});

Input.displayName = "Input";

export default Input;
