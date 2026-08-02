(function(){
  (function(){
    function isNum(t){return typeof t==="number" && Number.isFinite(t);}
    function round3(t){return Math.round(t*1000)/1000;}
    function cleanStr(t){return t.replace(/\r/g,"").replace(/[\u200B-\u200D\u2060\uFEFF]/g,"").trim();}

    function formatLrcTime(t){
      let m = Math.floor(t/60);
      let s = Math.floor(t%60);
      let ms = Math.floor((t%1)*100);
      return `[${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}.${ms.toString().padStart(2,"0")}]`;
    }

    function formatSrtTime(t){
      let h = Math.floor(t/3600);
      let m = Math.floor((t%3600)/60);
      let s = Math.floor(t%60);
      let ms = Math.floor((t%1)*1000);
      return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")},${ms.toString().padStart(3,"0")}`;
    }

    function getCookie(name){
      let r = `; ${document.cookie}`.split(`; ${name}=`);
      if(r.length >= 2) return r[r.length-1].split(";").shift();
    }

    async function fetchSunoApi(path, token){
      try{
        let r = await fetch(`https://studio-api.prod.suno.com${path}`,{
          headers: { Authorization: `Bearer ${token}` }
        });
        return r.ok ? await r.json() : null;
      }catch(e){
        console.error(e);
        return null;
      }
    }

    function renderOverlay(lyrics, errMessage, audioUrl){
      let old = document.getElementById("amuvi-pro-bm-overlay");
      if(old) old.remove();

      let overlay = document.createElement("div");
      overlay.id = "amuvi-pro-bm-overlay";
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(5, 8, 18, 0.88)",
        backdropFilter: "blur(12px)",
        zIndex: "999999",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        padding: "20px",
        boxSizing: "border-box"
      });

      let container = document.createElement("div");
      Object.assign(container.style, {
        background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)",
        border: "1px solid rgba(245, 158, 11, 0.4)",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "520px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.2)",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "18px"
      });

      let header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";

      let titleGroup = document.createElement("div");
      titleGroup.style.display = "flex";
      titleGroup.style.alignItems = "center";
      titleGroup.style.gap = "8px";

      let badge = document.createElement("span");
      badge.textContent = "PRO";
      Object.assign(badge.style, {
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "#000",
        fontWeight: "900",
        fontSize: "11px",
        padding: "2px 8px",
        borderRadius: "6px",
        letterSpacing: "1px"
      });

      let h2 = document.createElement("h2");
      h2.textContent = errMessage ? "AMUVI PRO Error" : "AMUVI PRO Export";
      Object.assign(h2.style, { margin: "0", color: "#f8fafc", fontSize: "22px", fontWeight: "800" });

      titleGroup.appendChild(h2);
      if(!errMessage) titleGroup.appendChild(badge);
      header.appendChild(titleGroup);

      let select = null;
      if(!errMessage){
        select = document.createElement("select");
        Object.assign(select.style, {
          padding: "6px 12px",
          borderRadius: "8px",
          background: "#1e293b",
          color: "#f8fafc",
          border: "1px solid rgba(255,255,255,0.15)",
          outline: "none",
          cursor: "pointer",
          fontSize: "14px"
        });
        let optSrt = document.createElement("option"); optSrt.value = "srt"; optSrt.textContent = "SRT (字幕)";
        let optLrc = document.createElement("option"); optLrc.value = "lrc"; optLrc.textContent = "LRC (タイムコード歌詞)";
        select.appendChild(optSrt);
        select.appendChild(optLrc);
        header.appendChild(select);
      }

      container.appendChild(header);

      if(errMessage){
        let p = document.createElement("p");
        p.textContent = errMessage;
        p.style.color = "#f87171";
        container.appendChild(p);
      } else {
        let fmt = "srt";
        let generateContent = function(){
          if(!lyrics) return "";
          if(fmt === "srt"){
            return lyrics.map((l, i) => `${i+1}\n${formatSrtTime(l.start_s)} --> ${formatSrtTime(l.end_s)}\n${l.text}\n`).join("\n");
          } else {
            return lyrics.map(l => `${formatLrcTime(l.start_s)}${l.text}`).join("\n");
          }
        };

        let textarea = document.createElement("textarea");
        textarea.value = generateContent();
        textarea.readOnly = true;
        Object.assign(textarea.style, {
          width: "100%",
          height: "220px",
          backgroundColor: "#090d16",
          color: "#f1f5f9",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "14px",
          boxSizing: "border-box",
          fontFamily: "'Fira Code', monospace",
          fontSize: "12px",
          resize: "none"
        });
        container.appendChild(textarea);

        let btnGroup = document.createElement("div");
        btnGroup.style.display = "flex";
        btnGroup.style.gap = "10px";

        let downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Download .srt";
        Object.assign(downloadBtn.style, {
          flex: "1",
          padding: "12px",
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "15px",
          cursor: "pointer"
        });

        if(select){
          select.onchange = () => {
            fmt = select.value;
            textarea.value = generateContent();
            downloadBtn.textContent = `Download .${fmt}`;
          };
        }

        downloadBtn.onclick = () => {
          let content = generateContent();
          let blob = new Blob([content], { type: fmt === "srt" ? "text/srt" : "text/lrc" });
          let url = URL.createObjectURL(blob);
          let a = document.createElement("a");
          a.href = url;
          a.download = `amuvi-pro-lyrics-${Date.now()}.${fmt}`;
          a.click();
          URL.revokeObjectURL(url);
        };

        let openAppBtn = document.createElement("button");
        openAppBtn.textContent = "✨ Open in AMUVI PRO";
        Object.assign(openAppBtn.style, {
          flex: "1.2",
          padding: "12px",
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: "#0f172a",
          border: "none",
          borderRadius: "10px",
          fontWeight: "900",
          fontSize: "15px",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)"
        });

        openAppBtn.onclick = () => {
          let content = generateContent();
          let targetUrl = `https://amfmu49-spec.github.io/amuvi-pro/#lrc=${encodeURIComponent(content)}`;
          if(audioUrl) targetUrl += `&audio_url=${encodeURIComponent(audioUrl)}`;
          window.open(targetUrl, "_blank");
        };

        let closeBtn = document.createElement("button");
        closeBtn.textContent = "閉じる";
        Object.assign(closeBtn.style, {
          padding: "12px 18px",
          background: "rgba(255,255,255,0.1)",
          color: "#94a3b8",
          border: "none",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "15px",
          cursor: "pointer"
        });
        closeBtn.onclick = () => overlay.remove();

        btnGroup.appendChild(downloadBtn);
        btnGroup.appendChild(openAppBtn);
        btnGroup.appendChild(closeBtn);
        container.appendChild(btnGroup);
      }

      if(errMessage){
        let closeBtn = document.createElement("button");
        closeBtn.textContent = "閉じる";
        Object.assign(closeBtn.style, {
          padding: "12px 24px",
          background: "#334155",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "15px",
          cursor: "pointer",
          marginTop: "10px"
        });
        closeBtn.onclick = () => overlay.remove();
        container.appendChild(closeBtn);
      }

      overlay.appendChild(container);
      document.body.appendChild(overlay);
    }

    async function main(){
      let path = window.location.pathname;
      if(!path.startsWith("/song/")){
        return renderOverlay(null, "Sunoの楽曲ページ (suno.com/song/...) を開いた状態で実行してください。");
      }
      let songId = path.split("/").pop();
      if(!songId) return renderOverlay(null, "Song IDを検出できませんでした。");

      let token = getCookie("__session");
      if(!token) return renderOverlay(null, "Sunoにログインしてから実行してください。");

      try {
        let lyricsData = await fetchSunoApi(`/api/gen/${songId}/aligned_lyrics/v2/`, token);
        let rawAligned = Array.isArray(lyricsData?.aligned_lyrics) 
          ? lyricsData.aligned_lyrics 
          : lyricsData?.data?.aligned_lyrics || [];

        if(!rawAligned.length){
          return renderOverlay(null, "この楽曲にはタイムコード付き歌詞データがまだ用意されていません。");
        }

        let clipData = await fetchSunoApi(`/api/clip/${songId}`, token);
        let audioUrl = clipData?.audio_url ?? clipData?.clip_url ?? null;

        let parsedLyrics = rawAligned.map(item => {
          let text = cleanStr(item.text || item.word || "");
          let start = isNum(item.start_s) ? item.start_s : 0;
          let end = isNum(item.end_s) ? item.end_s : start + 2.5;
          return { text, start_s: round3(start), end_s: round3(end) };
        }).filter(item => item.text.length > 0);

        renderOverlay(parsedLyrics, null, audioUrl);
      } catch(e) {
        renderOverlay(null, `エラーが発生しました: ${e.message}`);
      }
    }

    main();
  })();
})();
