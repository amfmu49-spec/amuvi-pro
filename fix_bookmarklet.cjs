const fs = require('fs');
let b = fs.readFileSync('unencoded.txt', 'utf8');

// Strip wrapper
b = b.replace(/^javascript:\(function\(\)\{/, '');
b = b.replace(/\}\)\(\);$/, '');

let startIdx = b.indexOf('function k(t,e){');
let endIdx = b.indexOf('}async function ft');

let prefix = b.substring(0, startIdx);
let suffix = b.substring(endIdx);

let newK = `function k(t,e){
    if(e) {
        alert(e);
    } else {
        let s = t.map(d => {
            let m = Math.floor(d.start_s/60).toString().padStart(2,"0");
            let sec = Math.floor(d.start_s%60).toString().padStart(2,"0");
            let ms = Math.floor((d.start_s%1)*100).toString().padStart(2,"0");
            return \`[\${m}:\${sec}.\${ms}]\${d.text}\`;
        }).join("\\n");
        window.location.href = "https://amfmu49-spec.github.io/lyric-motion-app/#lrc=" + encodeURIComponent(s);
    }
}`;

let finalCode = prefix + newK + suffix;
fs.writeFileSync('public/bookmarklet.js', finalCode);
