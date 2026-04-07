document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("globe-container")

    if (!container) return

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    )

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)

    container.appendChild(renderer.domElement)

    camera.position.set(0, 0, 2)
    camera.lookAt(0, 0, 0)

    const geometry = new THREE.SphereGeometry(0.8, 64, 64)

    const texture = new THREE.TextureLoader().load(
        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
    )

    const material = new THREE.MeshPhongMaterial({ map: texture })

    const globe = new THREE.Mesh(geometry, material)

    scene.add(globe)

    const light = new THREE.PointLight(0xffffff, 1)
    light.position.set(5, 3, 5)

    scene.add(light)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    function animate() {

        requestAnimationFrame(animate)

        globe.rotation.y += 0.002

        renderer.render(scene, camera)

    }

    animate()
    const flags = [
        "🇲🇽", "🇨🇴", "🇦🇷", "🇨🇱", "🇵🇪",
        "🇨🇺", "🇩🇴", "🇵🇷", "🇵🇦", "🇸🇻",
        "🇪🇨", "🇻🇪", "🇪🇸"
    ]

    flags.forEach((flag, i) => {

        const div = document.createElement("div")

        div.innerHTML = flag

        div.style.position = "absolute"
        div.style.fontSize = "28px"
        div.style.pointerEvents = "none"

        container.appendChild(div)

        function animateFlag() {

            const rect = container.getBoundingClientRect()

            const angle = Date.now() * 0.0004 + i * 0.5

            const radius = rect.width * 0.35

            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            div.style.transform =
                `translate(${rect.width / 2 - 15 + x}px, ${rect.height / 2 - 440 + y}px)`

            requestAnimationFrame(animateFlag)

        }

        animateFlag()

    })

})