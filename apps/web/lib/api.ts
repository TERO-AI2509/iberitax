type TreeItem = { path: string; label: string; children?: TreeItem[] }

export async function apiGetTree(_id: string): Promise<TreeItem> {
  return {
    path: "/overview",
    label: "Overview",
    children: [
      { path: "/personal", label: "Personal data" },
      {
        path: "/family",
        label: "Family",
        children: [
          { path: "/family/marital", label: "Marital status" },
          { path: "/family/children", label: "Children" },
          { path: "/family/disability", label: "Disability" },
          { path: "/family/dependents", label: "Elderly or other dependents" }
        ]
      },
      {
        path: "/income",
        label: "Income",
        children: [
          { path: "/income/salary", label: "Salary" }
        ]
      },
      {
        path: "/capital-mobiliario",
        label: "Capital mobiliario",
        children: [
          { path: "/capital-mobiliario/dividends", label: "Dividends" },
          { path: "/capital-mobiliario/interests", label: "Interests" }
        ]
      },
      {
        path: "/capital-inmobiliario",
        label: "Capital inmobiliario",
        children: [
          { path: "/capital-inmobiliario/properties", label: "Properties" }
        ]
      },
      {
        path: "/gains",
        label: "Capital gains",
        children: [
          { path: "/gains/securities", label: "Gains – Securities" },
          { path: "/gains/property", label: "Gains – Property" },
          { path: "/gains/crypto", label: "Gains – Crypto" }
        ]
      },
      {
        path: "/self-employment",
        label: "Self-employed / Business",
        children: [
          { path: "/self-employment/direct", label: "Direct assessment" },
          { path: "/self-employment/modules", label: "Modules" }
        ]
      },
      { path: "/withholdings", label: "Withholdings" },
      { path: "/imputed-income", label: "Imputed income" },
      {
        path: "/housing",
        label: "Housing",
        children: [
          { path: "/housing/owner", label: "Owner" },
          { path: "/housing/tenant", label: "Tenant" },
          { path: "/housing/mortgage", label: "Mortgage" }
        ]
      },
      {
        path: "/deductions",
        label: "Deductions",
        children: [
          { path: "/deductions/general", label: "General" },
          { path: "/deductions/regional", label: "Regional" }
        ]
      },
      { path: "/summary", label: "Summary" },
      { path: "/review", label: "Review" }
    ]
  }
}
