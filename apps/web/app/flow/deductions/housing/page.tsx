import SectionGate from "@/components/flow/SectionGate";
export default function Page(){
  const options=[
    { label:"Owner", href:"/flow/deductions/housing/owner" },
    { label:"Tenant", href:"/flow/deductions/housing/tenant" },
    { label:"Sale of property", href:"/flow/deductions/housing/sale" }
  ];
  return <SectionGate title="Housing" options={options} />;
}
