import { Route, Routes } from "react-router-dom";
import {
  AddressPage,
  AnalyzingPage,
  ContactPage,
  HomePage,
  OfferPage,
  PropertyPhotosPage,
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
  </Routes>
);

export default App;
