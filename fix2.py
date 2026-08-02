import urllib.parse
import sys

with open("temp.txt", "r", encoding="utf-8") as f:
    raw = f.read().strip()

if raw.startswith("javascript:"):
    raw = raw[11:]

decoded = urllib.parse.unquote(raw)

# The target we want to replace:
target = 'let g=document.createElement("button");g.textContent="Open in App",Object.assign(g.style,{flex:"1",padding:"12px",background:"#10b981",color:"#fff",border:"none",borderRadius:"8px",fontWeight:"bold",fontSize:"16px",cursor:"pointer"}),g.onclick=()=>{let d=s(),p=encodeURIComponent(d);window.open(`https://amfmu49-spec.github.io/lyric-motion-app/?lrc=${p}`,"_blank")}'

# The new code:
replacement = 'let g=document.createElement("a");g.textContent="Open in App";g.target="_blank";Object.assign(g.style,{flex:"1",padding:"12px",background:"#10b981",color:"#fff",border:"none",borderRadius:"8px",fontWeight:"bold",fontSize:"16px",cursor:"pointer",textAlign:"center",textDecoration:"none",display:"inline-block",boxSizing:"border-box"});g.onclick=()=>{g.href=`https://amfmu49-spec.github.io/lyric-motion-app/#lrc=${encodeURIComponent(s())}`;}'

if target in decoded:
    new_decoded = decoded.replace(target, replacement)
    new_raw = "javascript:" + new_decoded
    with open("unencoded.txt", "w", encoding="utf-8") as f:
        f.write(new_raw)
    print("Success")
else:
    print("Target not found in decoded string!")
