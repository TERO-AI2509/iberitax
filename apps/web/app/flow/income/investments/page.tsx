import SectionGate from "@/components/flow/SectionGate";
export default function Page(){
  const options=[
    { label:"Interest", href:"/flow/income/investments/interest" },
    { label:"Dividends", href:"/flow/income/investments/dividends" },
    { label:"Funds/ETFs", href:"/flow/income/investments/funds" },
    { label:"Stocks", href:"/flow/income/investments/stocks" },
    { label:"Crypto", href:"/flow/income/investments/crypto" }
  ];
  return <SectionGate title="Investments" options={options} />;
}
