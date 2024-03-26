/**
 * Base
 */
const canvas = document.querySelector('canvas.billboard')



/**
 * Scene
 */
const scene = new THREE.Scene()



/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
    `,
    uniforms: {
        uAlpha: {
            value: 1.0
        }
    },
    transparent: true
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay)



/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar')
const bodyElement = document.querySelector('body')

const loadingManager = new THREE.LoadingManager(
    () => {
        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1
            })
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1
            })

            loadingBarElement.classList.add('ended')
            bodyElement.classList.add('loaded')
            loadingBarElement.style.transform = ''

        }, 500)
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        console.log(itemUrl, itemsLoaded, itemsTotal)
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
        console.log(progressRatio)
    },
    () => {

    }
)
const gltfLoader = new THREE.GLTFLoader(loadingManager)



/**
 *  Textures
 */
const textureLoader = new THREE.TextureLoader()
const alphaShadow = textureLoader.load('/assets/anuncio/textures/45_x_15_emissive.jpeg');

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        transparent: true,
        color: 0x000000,
        opacity: 0.5,
        alphaMap: alphaShadow
    })
)

sphereShadow.rotation.x = -Math.PI * 0.5
sphereShadow.position.y = -1
sphereShadow.position.x = 1.5;

scene.add(sphereShadow)



/**
 * GLTF Model
 */
let anuncio = null

const gltLoader = new THREE.GLTFLoader(loadingManager)
gltLoader.load(
    './assets/anuncio/Pantalla_12x6.glb',
    (gltf) => {
        anuncio = gltf.scene

        anuncio.position.x = 0.5
        anuncio.rotation.x = -0.1
        anuncio.rotation.y = -2.2
        anuncio.position.y = -1.3

        const radius = 0.0099
        anuncio.scale.set(radius*2.75, radius, radius*2.5)

        scene.add(anuncio)
    }
)



/**
 * Scroll
 */
/*
let scrollY = window.scrollY
let currentSection = 0

const transformAnuncio = [{
        rotationZ: -0.45,
        positionX: 1.5,
        rotationY: 0.8
    },
    {
        rotationZ: 0.45,
        positionX: -1.5
    },
    {
        rotationZ: 0.0314,
        positionX: 0
    },
    {
        rotationZ: 0.0314,
        positionX: 0
    },
]

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    
    const newSection = Math.round(scrollY / sizes.height)

    console.log(newSection);

    if (newSection != currentSection) {
        currentSection = newSection

        if (!!anuncio) {
            gsap.to(
                anuncio.rotation, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    y: transformAnuncio[currentSection].rotationZ
                }
            )
            gsap.to(
                anuncio.position, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: transformAnuncio[currentSection].positionX
                }
            )
            gsap.to(
                sphereShadow.position, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: transformAnuncio[currentSection].positionX - 0.2
                }
            )
        }
    }
})
*/


/**
 * On Reload
 */
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}



/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 5
scene.add(camera)



/**
 * Light
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 5, 5)
directionalLight.castShadow = true
scene.add(directionalLight)



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width * 0.50, sizes.height * 0.50)
renderer.render(scene, camera)



/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    lastElapsedTime = elapsedTime

    renderer.render(scene, camera)

    if (!!anuncio) {
        anuncio.position.y = Math.sin(elapsedTime * .1) * 0.3 - 1.5
    }

    window.requestAnimationFrame(tick) 
}

tick()