import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Company from "../pages/Company";
import DashLayout from "../components/Layout";
import Record from "../pages/Record";
import Dashboard from "../pages/Dashboard";
import AddRecord from "../pages/AddRecord";
import Login from "../pages/Login";
import PrivateRoute from "../components/PrivateRoute";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DashLayout />}>
        <Route
          index
          element={
            <PrivateRoute>
              <Record />
            </PrivateRoute>
          }
        />
        <Route
          path="addRecord"
          element={
            <PrivateRoute>
              <AddRecord />
            </PrivateRoute>
          }
        />
        <Route
          path="company"
          element={
            <PrivateRoute>
              <Company />
            </PrivateRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Route>
    </>
  ),
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
      v7_startTransition: true,
    },
  }
);
export default router;
