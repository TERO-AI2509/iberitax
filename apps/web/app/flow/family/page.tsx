import SectionGate from "@/components/flow/SectionGate";
export default function Page(){
  const options=[
    { label:"Marital status", href:"/flow/family/marital-status" },
    { label:"Spouse / Pareja de hecho", href:"/flow/family/spouse" },
    { label:"Dependents", href:"/flow/family/dependents" },
    { label:"Family benefits", href:"/flow/family/benefits" }
  ];
  return <SectionGate title="Family" options={options} />;
}
