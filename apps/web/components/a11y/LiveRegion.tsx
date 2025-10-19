"use client"
import {useEffect,useRef,useState} from "react"
export default function LiveRegion(){const r=useRef<HTMLDivElement>(null);const[message,setMessage]=useState<string>("");useEffect(()=>{const h=(e:CustomEvent<string>)=>{setMessage(e.detail||"")};window.addEventListener("tero:announce",h as EventListener);return()=>window.removeEventListener("tero:announce",h as EventListener)},[]);useEffect(()=>{if(r.current){r.current.textContent="";r.current.textContent=message}},[message]);return(<div ref={r} role="status" aria-live="polite" aria-atomic="true" style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(1px,1px,1px,1px)"}} />)}
export function announce(msg:string){window.dispatchEvent(new CustomEvent("tero:announce",{detail:msg}))}
