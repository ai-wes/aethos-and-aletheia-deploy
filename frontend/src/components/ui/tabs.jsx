import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext();

export const Tabs = ({
  children,
  value,
  onValueChange,
  defaultValue,
  className = "",
  style = {},
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue || "");

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const currentValue = value !== undefined ? value : activeTab;

  return (
    <TabsContext.Provider
      value={{ value: currentValue, onValueChange: handleTabChange }}
    >
      <div
        className={`tabs ${className}`}
        style={{
          width: "100%",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({
  children,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <div
      className={`tabs-list ${className}`}
      style={{
        display: "flex",
        backgroundColor: "rgba(11, 14, 17, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        padding: "4px",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({
  children,
  value,
  className = "",
  style = {},
  ...props
}) => {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  const handleClick = () => {
    if (context?.onValueChange) {
      context.onValueChange(value);
    }
  };

  return (
    <button
      className={`tabs-trigger ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 16px",
        backgroundColor: isActive ? "rgba(35, 217, 217, 0.2)" : "transparent",
        color: isActive ? "#23d9d9" : "#8f9aa6",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.3s ease",
        flex: 1,
        justifyContent: "center",
        ...style,
      }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  children,
  value,
  className = "",
  style = {},
  ...props
}) => {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  if (!isActive) {
    return null;
  }

  return (
    <div
      className={`tabs-content ${className}`}
      style={{
        marginTop: "24px",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
