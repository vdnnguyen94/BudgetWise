import React from "react";
import { useParams } from "react-router-dom";
import SharedDashboard from "./SharedDashboard";

const DashboardWrapper = () => {
  const { role } = useParams();

  if (!role) {
    return <h2>Please log in to view your dashboard.</h2>;
  }

  return <SharedDashboard role={role} />;
};

export default DashboardWrapper;
