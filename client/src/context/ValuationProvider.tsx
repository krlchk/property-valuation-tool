import { useState, type ReactNode } from "react";
import { ValuationContext, type PropertyData } from "./ValuationContext";

export const ValuationProvider = ({ children }: { children: ReactNode }) => {
  const [property, setProperty] = useState<PropertyData | null>(null);

  return (
    <ValuationContext.Provider value={{ property, setProperty }}>
      {children}
    </ValuationContext.Provider>
  );
};
