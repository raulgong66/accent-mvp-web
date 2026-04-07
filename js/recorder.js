const API_URL = "https://accent-mvp-production.up.railway.app/predict"

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
        el_salvador: "🇸🇻"
    }

    const accent = data.accent.toLowerCase()
    const flag = flags[accent] || "🌎"

    status.innerText = ""

    result.innerHTML = `Detected accent: ${flag} ${data.accent}`
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

        const blob = new Blob(chunks, { type: "audio/wav" })

        const formData = new FormData()
        formData.append("file", blob, "audio.wav")
        formData.append("country", country)

        await fetch("https://YOUR_API_URL/donate", {
            method: "POST",
            body: formData
        })

        alert("Thank you for helping improve the model!")
    }

    recorder.start()

    donateBtn.innerText = "🔴 Recording..."

    setTimeout(() => {
        recorder.stop()
        donateBtn.innerText = "🎙 Record my voice"
    }, 6000)
}