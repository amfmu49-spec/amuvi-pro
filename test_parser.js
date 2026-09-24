const srtText = `
6
00:00:45,159 --> 00:00:49,149
捨てることなんて、到底できなくて

7
00:00:49,149 --> 00:00:52,579
震える指先をすり抜けた
`;

function srtTimeToSec(timeCode) {
    const tcParts = timeCode.split(/[:,]/);
    if (tcParts.length >= 4) {
        const h = parseInt(tcParts[0], 10);
        const m = parseInt(tcParts[1], 10) + h * 60;
        const s = parseInt(tcParts[2], 10);
        const ms = parseInt(tcParts[3], 10);
        return m * 60 + s + (ms / 1000);
    }
    return 0;
}

function parseSrtToLrc(srtText) {
    const blocks = srtText.trim().split(/\r?\n\r?\n/);
    const lrcLines = [];
    for (const block of blocks) {
        const lines = block.split(/\r?\n/);
        console.log("Block lines:", lines);
        if (lines.length >= 3) {
            const timeCode = lines[1].split(' --> ')[0];
            if (timeCode) {
                const totalSec = srtTimeToSec(timeCode);
                const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
                const s = (totalSec % 60).toFixed(2).padStart(5, '0');
                const textLine = lines.slice(2).join(' ');
                lrcLines.push(`[${m}:${s}]${textLine}`);
            }
        }
    }
    return lrcLines.join('\n');
}

console.log(parseSrtToLrc(srtText));
