export type QNode = { key: string; title: string; path: string; children?: QNode[] };

export const modelo100Tree: QNode[] = [
  {
    key: "personal",
    title: "Personal data",
    path: "/personal",
    children: [
      { key: "family",   title: "Family",                   path: "/family" },
      { key: "marital",  title: "Marital status",           path: "/family/marital-status" },
      { key: "spouse",   title: "Spouse / partner",         path: "/family/spouse" },
      { key: "children", title: "Children",                 path: "/family/children" },
      { key: "disability", title: "Disability",             path: "/family/disability" },
      { key: "elderly",  title: "Elderly or other dependents", path: "/family/dependents" }
    ]
  },
  {
    key: "income",
    title: "Income",
    path: "/income",
    children: [
      { key: "income.salary",   title: "Salary",          path: "/income/salary" },
      { key: "income.pensions", title: "Pensions",        path: "/income/pensions" },
      { key: "income.foreign",  title: "Foreign income",  path: "/income/foreign" }
    ]
  },
  {
    key: "capital-mobiliario",
    title: "Capital mobiliario",
    path: "/capital-mobiliario",
    children: [
      { key: "capital-mobiliario.dividends", title: "Dividends", path: "/capital-mobiliario/dividends" },
      { key: "capital-mobiliario.interest",  title: "Interests",  path: "/capital-mobiliario/interests" }
    ]
  },
  {
    key: "capital-inmobiliario",
    title: "Capital inmobiliario",
    path: "/capital-inmobiliario",
    children: [
      { key: "capital-inmobiliario.properties", title: "Properties", path: "/capital-inmobiliario/properties" }
    ]
  },
  {
    key: "gains",
    title: "Capital gains",
    path: "/gains",
    children: [
      { key: "gains.securities", title: "Gains – Securities", path: "/gains/securities" },
      { key: "gains.property",   title: "Gains – Property",   path: "/gains/property" },
      { key: "gains.crypto",     title: "Gains – Crypto",     path: "/gains/crypto" }
    ]
  },
  {
    key: "self-employment",
    title: "Self-employed / Business",
    path: "/self-employment",
    children: [
      { key: "self-employment.direct",  title: "Direct assessment", path: "/self-employment/direct" },
      { key: "self-employment.modules", title: "Modules",            path: "/self-employment/modules" }
    ]
  },
  { key: "withholdings",    title: "Withholdings",    path: "/withholdings" },
  { key: "imputed-income",  title: "Imputed income",  path: "/imputed-income" },
  {
    key: "housing",
    title: "Housing",
    path: "/housing",
    children: [
      { key: "housing.owner",    title: "Owner",    path: "/housing/owner" },
      { key: "housing.tenant",   title: "Tenant",   path: "/housing/tenant" },
      { key: "housing.mortgage", title: "Mortgage", path: "/housing/mortgage" }
    ]
  },
  {
    key: "deductions",
    title: "Deductions",
    path: "/deductions",
    children: [
      { key: "deductions.general",  title: "General",  path: "/deductions/general" },
      { key: "deductions.regional", title: "Regional", path: "/deductions/regional" }
    ]
  },
  { key: "summary", title: "Summary", path: "/summary" },
  { key: "review",  title: "Review",  path: "/review" }
];
