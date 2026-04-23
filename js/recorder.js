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
    }, 10000)
}

/* ---------- SEND AUDIO ---------- */

async function sendAudio() {
    const status = document.getElementById("status")
    const result = document.getElementById("result")
    
    status.innerText = "Analyzing accent..."
    
    // Timer to notify if server is cold starting (Render free tier)
    const wakeUpTimer = setTimeout(() => {
        status.innerText = "Server is waking up, please wait (this can take 30s)..."
    }, 5000)

    try {
        const blob = new Blob(chunks, { type: "audio/wav" })
        const formData = new FormData()
        formData.append("file", blob, "audio.wav")

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        })

        if (!response.ok) throw new Error(`Server error: ${response.status}`)

        const data = await response.json()
        clearTimeout(wakeUpTimer) // Stop the timer if we got a response

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
        
        // Detect language from <html> tag
        const isSpanish = document.documentElement.lang === "es"
        
        // Beautify display name
        let displayName = data.accent
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        // Bilingual logic for Dominican Republic
        if (accentKey === "dominican_republic") {
            displayName = isSpanish ? "República Dominicana" : "Dominican Republic"
        }

        status.innerText = ""

        result.innerHTML = `
            <div class="result-accent">${flag} ${displayName}</div>
            <div class="result-confidence">Confidence: ${confidence}%</div>
        `

    } catch (error) {
        clearTimeout(wakeUpTimer)
        console.error("Inference Error:", error)
        status.innerText = isSpanish 
            ? "❌ Error de conexión. Por favor, intenta de nuevo." 
            : "❌ Connection error. Please try again."
        status.style.color = "#ff4444"
    }
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
    }, 20000)
}