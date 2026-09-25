import urllib.request
import urllib.parse
text = urllib.request.urlopen('https://amfmu49-spec.github.io/lyric-motion-app/bookmarklet.js').read().decode('utf-8')

# Remove the wrapper
text = text.replace('(function(){(async function(){', '(async function(){')
text = text.replace('})();})();', '})();')

# Remove the dropdown select
text = text.replace('let select=document.createElement("select");Object.assign(select.style,{padding:"6px 12px",borderRadius:"8px",background:"#27272a",color:"#fff",border:"1px solid #3f3f46",outline:"none",cursor:"pointer"});select.innerHTML=\'<option value="lrc">LRC形式</option><option value="srt">SRT形式</option>\';header.appendChild(title);header.appendChild(select);box.appendChild(header);', 'header.appendChild(title);box.appendChild(header);')
text = text.replace('select.onchange=()=>{currentFormat=select.value;textarea.value=getFormattedText();dlBtn.textContent=`Download .${currentFormat}`};', '')

# Change currentFormat to srt
text = text.replace('let currentFormat="lrc"', 'let currentFormat="srt"')
text = text.replace('dlBtn.textContent="⬇️ Download .lrc"', 'dlBtn.textContent="⬇️ Download .srt"')

# Replace Open Btn
old_open_btn = 'let openBtn=document.createElement("a");openBtn.textContent="🚀 Open in App";openBtn.target="_blank";Object.assign(openBtn.style,{flex:"2",minWidth:"160px",padding:"10px",background:"#16a34a",color:"#fff",border:"none",borderRadius:"8px",fontWeight:"bold",cursor:"pointer",textAlign:"center",textDecoration:"none",display:"inline-block",boxSizing:"border-box"});openBtn.onclick=()=>{openBtn.href=`https://amfmu49-spec.github.io/lyric-motion-app/#lrc=${encodeURIComponent(getFormattedText())}&audio_url=${encodeURIComponent(audioUrl)}`};'

new_open_btn = """let openBtn=document.createElement("a");openBtn.textContent="AMUVI";openBtn.target="_blank";Object.assign(openBtn.style,{flex:"1",minWidth:"80px",padding:"10px",background:"#16a34a",color:"#fff",border:"none",borderRadius:"8px",fontWeight:"bold",cursor:"pointer",textAlign:"center",textDecoration:"none",display:"inline-block",boxSizing:"border-box"});openBtn.onclick=()=>{openBtn.href=`https://amfmu49-spec.github.io/lyric-motion-app/#lrc=${encodeURIComponent(getFormattedText())}&audio_url=${encodeURIComponent(audioUrl)}`};let openBtnPro=document.createElement("a");openBtnPro.textContent="AMUVI PRO";openBtnPro.target="_blank";Object.assign(openBtnPro.style,{flex:"1",minWidth:"80px",padding:"10px",background:"#6366f1",color:"#fff",border:"none",borderRadius:"8px",fontWeight:"bold",cursor:"pointer",textAlign:"center",textDecoration:"none",display:"inline-block",boxSizing:"border-box"});openBtnPro.onclick=()=>{openBtnPro.href=`https://amfmu49-spec.github.io/AMUVI-PRO/#lrc=${encodeURIComponent(getFormattedText())}&audio_url=${encodeURIComponent(audioUrl)}`};"""

text = text.replace(old_open_btn, new_open_btn)
text = text.replace('btnRow.appendChild(openBtn);', 'btnRow.appendChild(openBtn);btnRow.appendChild(openBtnPro);')

bm = 'javascript:(function(){' + text + '})();'
open('new_bookmarklet.txt', 'w', encoding='utf-8').write(bm)
open('new_bookmarklet_encoded.txt', 'w', encoding='utf-8').write('javascript:' + urllib.parse.quote('(function(){' + text + '})();'))
print("DONE")
