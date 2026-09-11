import { createContext, useContext } from "react";
import type { Address } from "../types/address";

export type PropertyData = Address;

export type ValuationContextType = {
  property: PropertyData | null;
  setProperty: (property: PropertyData) => void;
};

export const ValuationContext = createContext<ValuationContextType | undefined>(
  undefined,
);

export const useValuation = () => {
  const context = useContext(ValuationContext);

  if (!context) {
    throw new Error("useValuation must be used inside ValuationProvider");
  }

  return context;
};
