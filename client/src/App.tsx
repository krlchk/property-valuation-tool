import { Route, Routes } from "react-router-dom";
import {
  AddressPage,
  AnalyzingPage,
  ContactPage,
  OfferHeldPage,
  OfferPage,
  PropertyPhotosPage,
  RepairBreakdownPage,
  TimelinePage,
} from "./pages";
import { PropertyFlowLayout } from "./layouts/PropertyFlowLayout";

const App = () => (
  <Routes>
    <Route element={<AddressPage />} path="/" />
    <Route element={<PropertyFlowLayout />} path="/addresses/:addressId">
      <Route element={<PropertyPhotosPage />} path="photos" />
      <Route element={<TimelinePage />} path="timeline" />
      <Route element={<ContactPage />} path="contact" />
      <Route element={<AnalyzingPage />} path="analyzing" />
      <Route element={<OfferPage />} path="offer" />
      <Route element={<RepairBreakdownPage />} path="offer/breakdown" />
      <Route element={<OfferHeldPage />} path="offer/held" />
    </Route>
  </Routes>
);

export default App;
