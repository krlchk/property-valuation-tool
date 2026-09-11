import { Route, Routes } from "react-router-dom";
import {
  AddressPage,
  AnalyzingPage,
  ContactPage,
  EstimateAcceptedPage,
  EstimateReadyPage,
  HomePage,
  OfferPage,
  PropertyPhotosPage,
  RepairBreakdownPage,
} from "./pages";

const App = () => (
  <Routes>
    <Route element={<HomePage />} path="/" />
    <Route element={<AddressPage />} path="/addresses" />
    <Route
      element={<PropertyPhotosPage />}
      path="/addresses/:addressId/photos"
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
    <Route
      element={<EstimateReadyPage />}
      path="/addresses/:addressId/offer/confirmed"
    />
  </Routes>
);

export default App;
