import { ImageResponse } from "next/og";
export const alt = "Eddy Missoni — Penser juste. Construire utile.";
export const size = { width:1200, height:630 };
export const contentType = "image/png";
export default function Image(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:70,background:"#f3f0e8",color:"#242822",fontFamily:"sans-serif"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:23}}><span>eddy missoni.</span><span>DATA · IA · EXPLORATIONS</span></div><div style={{display:"flex",flexDirection:"column",fontSize:88,letterSpacing:-5,lineHeight:1.05}}><span>Penser juste.</span><span style={{color:"#293fce"}}>Construire utile.</span></div><div style={{display:"flex",fontSize:22}}>Un regard personnel sur la technologie et ce qu’elle rend possible.</div></div>,size);}

