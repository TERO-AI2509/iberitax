import SectionGate from "@/components/flow/SectionGate";
export default function Page(){
  const options=[
    { label:"Housing", href:"/flow/deductions/housing" },
    { label:"Health", href:"/flow/deductions/health" },
    { label:"Education", href:"/flow/deductions/education" },
    { label:"Donations", href:"/flow/deductions/donations" },
    { label:"Regional / Other", href:"/flow/deductions/regional" }
  ];
  return <SectionGate title="Deductions" options={options} />;
}
