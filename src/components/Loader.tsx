import React, { FC } from "react";

interface ILoaderProps {
  size?: number;
  thin?: number;
  backgroundColor?: string;
  color?: string;
}

const Loader: FC<ILoaderProps> = ({ size, thin, backgroundColor, color }) => {
  return (
    <div
      className="sp-circle"
      style={{
        height: `${size}px`,
        width: `${size}px`,
        borderWidth: `${thin}px`,
        borderTopWidth: `${thin}px`,
        borderColor: `${backgroundColor}`,
        borderTopColor: `${color}`,
      }}
    />
  );
};

export default Loader;
