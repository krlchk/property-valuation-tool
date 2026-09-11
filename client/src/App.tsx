import { Route, Routes } from "react-router-dom";
import { AddressPage, HomePage, PropertyPhotosPage } from "./pages";

const App = () => (
  <Routes>
    <Route element={<HomePage />} path="/" />
    <Route element={<AddressPage />} path="/addresses" />
    <Route
      element={<PropertyPhotosPage />}
      path="/addresses/:addressId/photos"
    />
  </Routes>
);

export default App;
