import React from "react";

export const Alert = ({
  children,
  className = "",
  style = {},
  variant = "default",
  ...props
}) => {
  const baseStyles = {
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  };

  const variants = {
    default: {
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderColor: "rgba(59, 130, 246, 0.3)",
      color: "#93c5fd",
    },
    destructive: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      borderColor: "rgba(239, 68, 68, 0.3)",
      color: "#fca5a5",
    },
    warning: {
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      borderColor: "rgba(245, 158, 11, 0.3)",
      color: "#fbbf24",
    },
    success: {
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      borderColor: "rgba(34, 197, 94, 0.3)",
      color: "#86efac",
    },
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <div
      className={`alert ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertDescription = ({
  children,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <div
      className={`alert-description ${className}`}
      style={{
        fontSize: "14px",
        lineHeight: "1.5",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertTitle = ({
  children,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <h5
      className={`alert-title ${className}`}
      style={{
        margin: 0,
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "4px",
        ...style,
      }}
      {...props}
    >
      {children}
    </h5>
  );
};
