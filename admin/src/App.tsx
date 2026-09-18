import {
  Refine,
  Authenticated,
} from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  useNotificationProvider,
  ThemedLayout,
  ThemedSider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { App as AntdApp } from "antd";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/data";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { ForgotPassword } from "./pages/forgotPassword";
import { authProvider } from "./providers/auth";
import { PropertiesList, PropertyShow } from "./pages/properties";
import { OfferTermsEdit, OfferTermsList } from "./pages/offer-terms";
import { UserEdit, UsersList, UserShow } from "./pages/users";
import { OfferEdit, OffersList, OfferShow } from "./pages/offers";
import { ComponentsGradeEdit, ComponentsGradeList } from "./pages/components-grade";
import { BuildOutlined, FileTextOutlined, HomeOutlined, PercentageOutlined, UserOutlined } from "@ant-design/icons";

function App() {
  return (
    <BrowserRouter basename="/admin">
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
              <Refine
                dataProvider={dataProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                authProvider={authProvider}
                resources={[
                  {
                    name: "properties",
                    list: "/properties",
                    show: "/properties/:id",
                    edit: "/properties/:id/edit",
                    meta: {
                      canDelete: true,
                      icon: <HomeOutlined />
                    }
                  },
                  {
                    name: "users",
                    list: "/users",
                    show: "/users/:id",
                    edit: "/users/:id/edit",
                    meta: { 
                      canDelete: true,
                      icon: <UserOutlined />
                    },
                  },
                  {
                    name: "offers",
                    list: "/offers",
                    show: "/offers/:id",
                    edit: "/offers/:id/edit",
                    meta: { 
                      canDelete: true,
                      icon: <PercentageOutlined />
                    },
                  },
                  {
                    name: "offer-terms",
                    list: "/offer-terms",
                    edit: "/offer-terms/:id/edit",
                    meta: {
                      canDelete: true,
                      icon: <FileTextOutlined />
                    },
                  },
                  {
                    name: "components-grade",
                    list: "/components-grade",
                    edit: "/components-grade/:componentKey/:grade/edit",
                    meta: {
                      canDelete: true,
                      icon: <BuildOutlined />
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  title:{
                    text:"Instacashly Admin"
                  }
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayout
                          Header={Header}
                          Sider={(props) => <ThemedSider {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="properties" />}
                    />
                    <Route path="/properties">
                      <Route index element={<PropertiesList />} />
                      <Route path=":id" element={<PropertyShow />} />
                    </Route>
                    <Route path="/offer-terms">
                      <Route index element={<OfferTermsList />} />
                      <Route path=":id/edit" element={<OfferTermsEdit />} />
                    </Route>
                    <Route path="/users">
                      <Route index element={<UsersList />} />
                      <Route path=":id" element={<UserShow />} />
                      <Route path=":id/edit" element={<UserEdit />} />
                    </Route>
                    <Route path="/offers">
                      <Route index element={<OffersList />} />
                      <Route path=":id" element={<OfferShow />} />
                      <Route path=":id/edit" element={<OfferEdit />} />
                    </Route>
                    <Route path="/components-grade">
                      <Route index element={<ComponentsGradeList />} />
                      <Route path=":componentKey/:grade/edit" element={<ComponentsGradeEdit />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
