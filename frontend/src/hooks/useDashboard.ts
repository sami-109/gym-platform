import { useState } from "react";
import type { DashboardSection } from "../types/dashboards";

function useDashboard() {
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("memberships");

  return {
    activeSection,
    setActiveSection,
  };
}

export default useDashboard;
