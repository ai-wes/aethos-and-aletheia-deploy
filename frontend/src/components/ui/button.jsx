import React from "react";

export const Button = ({
  children,
  className = "",
  style = {},
  variant = "default",
  size = "default",
  disabled = false,
  onClick,
  ...props
}) => {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all 0.3s ease",
    textDecoration: "none",
    opacity: disabled ? 0.5 : 1,
  };

  const variants = {
    default: {
      backgroundColor: "#23d9d9",
      color: "#000",
      padding: "12px 24px",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#8f9aa6",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "12px 24px",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#8f9aa6",
      padding: "12px 24px",
    },
    destructive: {
      backgroundColor: "#ef4444",
      color: "#fff",
      padding: "12px 24px",
    },
  };

  const sizes = {
    sm: {
      padding: "6px 12px",
      fontSize: "12px",
    },
    default: {
      padding: "12px 24px",
      fontSize: "14px",
    },
    lg: {
      padding: "16px 32px",
      fontSize: "16px",
    },
  };

  const variantStyles = variants[variant] || variants.default;
  const sizeStyles = sizes[size] || sizes.default;

  return (
    <button
      className={`button ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles,
        ...sizeStyles,
        ...style,
      }}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
