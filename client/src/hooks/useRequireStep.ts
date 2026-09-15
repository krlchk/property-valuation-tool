import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useValuation } from "../context/ValuationContext";

export type RequiredStep = "photos" | "timeline" | "contact" | "offer";

const STEP_DEPTH: Record<RequiredStep, number> = {
  photos: 1,
  timeline: 2,
  contact: 3,
  offer: 4,
};

export const useRequireStep = (requiredStep: RequiredStep) => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { property, photos, selectedTerm, contact } = useValuation();

  const base = `/addresses/${addressId}`;

  const prerequisites = [
    { satisfied: Boolean(property), redirectTo: "/" },
    { satisfied: photos.length > 0, redirectTo: `${base}/photos` },
    {
      satisfied: Boolean(selectedTerm || property?.offerTermsId),
      redirectTo: `${base}/timeline`,
    },
    {
      satisfied: Boolean(
        contact.name && contact.phone && contact.email && contact.agreed,
      ),
      redirectTo: `${base}/contact`,
    },
  ];

  const firstUnmet = prerequisites
    .slice(0, STEP_DEPTH[requiredStep])
    .find((step) => !step.satisfied);
  const redirectTo = firstUnmet?.redirectTo;

  useEffect(() => {
    if (redirectTo) navigate(redirectTo, { replace: true });
  }, [redirectTo, navigate]);
};
