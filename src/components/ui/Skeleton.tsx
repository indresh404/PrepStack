import React from "react";

const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse skeleton-shimmer bg-slate-200 rounded-xl ${className}`}
    />
  );
};

export default Skeleton;