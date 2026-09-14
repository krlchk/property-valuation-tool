import { Route, Routes } from "react-router-dom";
import {
  AddressPage,
  AnalyzingPage,
  ContactPage,
  EstimateAcceptedPage,
  OfferPage,
  PropertyPhotosPage,
  RepairBreakdownPage,
  TimelinePage,
} from "./pages";

const App = () => (
  <Routes>
    <Route element={<AddressPage />} path="" />
    <Route
      element={<PropertyPhotosPage />}
      path="/addresses/:addressId/photos"
    />
    <Route
      element={<TimelinePage />}
      path="/addresses/:addressId/timeline"
    />
    <Route element={<ContactPage />} path="/addresses/:addressId/contact" />
    <Route element={<AnalyzingPage />} path="/addresses/:addressId/analyzing" />
    <Route element={<OfferPage />} path="/addresses/:addressId/offer" />
    <Route
      element={<RepairBreakdownPage />}
      path="/addresses/:addressId/offer/breakdown"
    />
    <Route
      element={<EstimateAcceptedPage />}
      path="/addresses/:addressId/offer/accepted"
    />
  </Routes>
);

export default App;
