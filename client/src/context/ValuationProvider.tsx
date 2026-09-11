import { useState, type ReactNode } from "react";
import { ValuationContext, type PropertyData } from "./ValuationContext";

export const ValuationProvider = ({ children }: { children: ReactNode }) => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [photoCount, setPhotoCount] = useState(0);

  return (
    <ValuationContext.Provider
      value={{ property, setProperty, photoCount, setPhotoCount }}
    >
      {children}
    </ValuationContext.Provider>
  );
};
