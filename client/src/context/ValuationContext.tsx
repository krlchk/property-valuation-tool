import { createContext, useContext, useState, type ReactNode } from "react";

type PropertyData = {
  title: string;
  subtitle: string;
};

type ValuationContextType = {
  property: PropertyData | null;
  setProperty: (property: PropertyData) => void;
};

const ValuationContext = createContext<ValuationContextType | undefined>(
  undefined,
);

export const ValuationProvider = ({ children }: { children: ReactNode }) => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  return (
    <ValuationContext.Provider
      value={{
        property,
        setProperty,
      }}
    >
      {children}
    </ValuationContext.Provider>
  );
};

export const useValuation = () => {
  const context = useContext(ValuationContext);

  if (!context) {
    throw new Error("useValuation must be used inside ValuationProvider");
  }

  return context;
};
