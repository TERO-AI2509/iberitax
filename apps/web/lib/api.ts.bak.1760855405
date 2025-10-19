
export async function apiGetTree(id:string){
  return {
    path:"/overview",
    label:"Overview",
    children:[
      { path:"/personal", label:"Personal data" },
      { path:"/family", label:"Family", children:[
        { path:"/family/marital", label:"Marital status" },
        { path:"/family/children", label:"Children" },
        { path:"/family/disability", label:"Disability" },
        { path:"/family/dependents", label:"Elderly or other dependents" },
      ]},
      { path:"/income", label:"Employment income", children:[ { path:"/income/salary", label:"Salary" } ]},
      { path:"/summary", label:"Summary" }
    ]
  }
}
