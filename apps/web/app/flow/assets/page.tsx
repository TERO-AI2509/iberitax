import SectionGate from "@/components/flow/SectionGate";
export default function Page(){
  const options=[
    { label:"Vehicles / Company car", href:"/flow/assets/vehicles" },
    { label:"Business", href:"/flow/assets/business" },
    { label:"Foreign assets", href:"/flow/assets/foreign-assets" }
  ];
  return <SectionGate title="Assets & Business" options={options} />;
}
