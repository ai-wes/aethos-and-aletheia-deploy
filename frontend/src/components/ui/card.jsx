import React from "react";

export const Card = ({ children, className = "", style = {}, ...props }) => {
  return (
    <div
      className={`card ${className}`}
      style={{
        backgroundColor: "rgba(11, 14, 17, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "0",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <div
      className={`card-header ${className}`}
      style={{
        padding: "20px 24px 16px 24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({
  children,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <h3
      className={`card-title ${className}`}
      style={{
        margin: 0,
        fontSize: "18px",
        fontWeight: "600",
        color: "#fff",
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent = ({
  children,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <div
      className={`card-content ${className}`}
      style={{
        padding: "20px 24px 24px 24px",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
