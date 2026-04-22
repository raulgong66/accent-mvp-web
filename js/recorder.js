// const API_URL = "https://accent-mvp-production.up.railway.app/predict" // Railway
const API_URL = "https://accent-mvp.onrender.com/predict" // Render

let recorder
let chunks = []

const recordBtn = document.getElementById("recordBtn")
const donateBtn = document.getElementById("donateBtn")
const status = document.getElementById("status")
const result = document.getElementById("result")
const countrySelect = document.getElementById("countrySelect")

/* ---------- DEMO RECORD ---------- */

recordBtn.addEventListener("click", startDemoRecording)

async function startDemoRecording() {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    recorder = new MediaRecorder(stream)
    chunks = []

    recorder.ondataavailable = e => chunks.push(e.data)
    recorder.onstop = sendAudio

    recorder.start()

    recordBtn.innerText = "🔴"
    status.innerText = "Recording..."

    setTimeout(() => {
        recorder.stop()
        status.innerText = "Analyzing accent..."
        recordBtn.innerText = "🎤"
    }, 4000)
}

/* ---------- SEND AUDIO ---------- */

async function sendAudio() {

    const blob = new Blob(chunks, { type: "audio/wav" })

    const formData = new FormData()
    formData.append("file", blob, "audio.wav")

    const response = await fetch(API_URL, {
        method: "POST",
        body: formData
    })

    const data = await response.json()

    const flags = {
        mexico: "🇲🇽",
        argentina: "🇦🇷",
        chile: "🇨🇱",
        colombia: "🇨🇴",
        peru: "🇵🇪",
        spain: "🇪🇸",
        usa: "🇺🇸",
        puerto_rico: "🇵🇷",
        dominican_republic: "🇩🇴",
        venezuela: "🇻🇪",
        ecuador: "🇪🇨",
        panama: "🇵🇦",
        el_salvador: "🇸🇻",
        bolivia: "🇧🇴",
        uruguay: "🇺🇾",
        paraguay: "🇵🇾",
        guatemala: "🇬🇹",
        honduras: "🇭🇳",
        nicaragua: "🇳🇮",
        costa_rica: "🇨🇷",
        cuba: "🇨🇺"
    }

    const accentKey = data.accent.toLowerCase()
    const flag = flags[accentKey] || "🌎"
    const confidence = Math.round(data.confidence * 100)
    
    // Beautify display name (e.g., puerto_rico -> Puerto Rico)
    const displayName = data.accent
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    status.innerText = ""

    result.innerHTML = `
        <div class="result-accent">${flag} ${displayName}</div>
        <div class="result-confidence">Confidence: ${confidence}%</div>
    `
}

/* ---------- DONATION RECORD ---------- */

donateBtn.addEventListener("click", startDonationRecording)

async function startDonationRecording() {

    const country = countrySelect.value

    if (!country) {
        alert("Please select your country first")
        return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    recorder = new MediaRecorder(stream)
    chunks = []

    recorder.ondataavailable = e => chunks.push(e.data)

    recorder.onstop = async () => {

        const blob = new Blob(chunks, { type: chunks[0].type })

        const formData = new FormData()
        formData.append("audio", blob, "audio.webm")
        formData.append("country", country)

        try {

            const response = await fetch("upload.php", {
                method: "POST",
                body: formData
            })

            const data = await response.json()
            console.log(data)

            alert("Thank you for helping improve the model!")

        } catch (error) {

            console.error("Upload error:", error)

        }

    }

    recorder.start()

    donateBtn.innerText = "🔴 Recording..."

    setTimeout(() => {
        recorder.stop()
        donateBtn.innerText = "🎙 Record my voice"
    }, 6000)
}