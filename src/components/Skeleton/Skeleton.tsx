import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./Skeleton.module.css";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  radius?: CSSProperties["borderRadius"];
  circle?: boolean;
};

export const Skeleton = ({
  width = "100%",
  height = "1rem",
  radius = "12px",
  circle = false,
  style,
  className,
  ...rest
}: SkeletonProps) => {
  return (
    <div
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      style={{
        width,
        height,
        borderRadius: circle ? "999px" : radius,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  );
};
