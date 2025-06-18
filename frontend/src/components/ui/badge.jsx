import React from "react";

export const Badge = ({
  children,
  className = "",
  style = {},
  variant = "default",
  ...props
}) => {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const variants = {
    default: {
      backgroundColor: "rgba(35, 217, 217, 0.2)",
      color: "#23d9d9",
      border: "1px solid #23d9d9",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#8f9aa6",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    destructive: {
      backgroundColor: "rgba(239, 68, 68, 0.2)",
      color: "#fca5a5",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    success: {
      backgroundColor: "rgba(34, 197, 94, 0.2)",
      color: "#86efac",
      border: "1px solid rgba(34, 197, 94, 0.3)",
    },
    warning: {
      backgroundColor: "rgba(245, 158, 11, 0.2)",
      color: "#fbbf24",
      border: "1px solid rgba(245, 158, 11, 0.3)",
    },
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <span
      className={`badge ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
