import { Route, Routes } from "react-router-dom";
import { AddressPage, HomePage } from "./pages";

function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<AddressPage />} path="/addresses" />
    </Routes>
  );
}

export default App;
