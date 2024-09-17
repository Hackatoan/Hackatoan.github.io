// =================== General Setup ===================
// Reference to the overlay and instructions
const overlay = document.getElementById("overlay");
const instructions = document.getElementById("instruction-text");
const hwainstructions = document.getElementById("hwa");

// Check if WebGL is supported
function isWebGLSupported() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

// Show or hide overlay
function showOverlay() {
  overlay.classList.remove("hidden");
  overlay.style.display = "block";
  setTimeout(() => {
    instructions.style.display = "none";
    hwainstructions.style.display = "none";
    overlay.classList.add("visible");
  }, 10); // Trigger transition after delay
}

function hideOverlay() {
  overlay.classList.remove("visible");
  overlay.classList.add("hidden");
  setTimeout(() => {
    instructions.style.display = "block";
    hwainstructions.style.display = "block";
    overlay.style.display = "none";
  }, 500); // Match the transition duration
}

// Add event listener for the ESC key to hide the overlay
window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideOverlay();
  }
});

// Add event listener for clicks outside the overlay
document.addEventListener("click", function (event) {
  if (
    overlay.classList.contains("visible") &&
    !overlay.contains(event.target)
  ) {
    hideOverlay();
  }
});

// Prevent click events within the overlay from propagating to the document
overlay.addEventListener("click", function (event) {
  event.stopPropagation();
});

// =================== 3D Scene Setup (WebGL) ===================
if (isWebGLSupported()) {
  hwainstructions.style.display = "none";

  // 3D Scene variables and setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue background

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Camera and lighting setup
  const radius = 20,
    baseRotationSpeed = 0.0001,
    maxRotationSpeed = 0.01,
    dampingFactor = 0.98;
  let angle = 0,
    scrollRotationSpeed = 0;

  camera.position.set(radius, 10, 0);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0x404040, 2));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 50, 50).castShadow = true;
  scene.add(directionalLight);

  // Post-processing setup
  const composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3,
    0.1,
    0.1
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 0.3;
  bloomPass.radius = 0.1;
  composer.addPass(bloomPass);

  const shaderPass = new THREE.ShaderPass(THREE.CopyShader);
  composer.addPass(shaderPass);

  // 3D Model loader
  const loader = new THREE.GLTFLoader();
  loader.load(
    "assets/models/volc.glb",
    function (gltf) {
      const object = gltf.scene;
      object.scale.set(10, 10, 10);
      scene.add(object);
    },
    undefined,
    function (error) {
      console.error("An error happened:", error);
    }
  );

  // Scroll event handler for rotation speed
  window.addEventListener("wheel", function (event) {
    scrollRotationSpeed += event.deltaY * 0.0005;
    scrollRotationSpeed = Math.max(
      Math.min(scrollRotationSpeed, maxRotationSpeed),
      -maxRotationSpeed
    );
  });

  // Update camera position
  function updateCameraPosition() {
    angle += baseRotationSpeed + scrollRotationSpeed;
    camera.position.x = radius * Math.cos(angle);
    camera.position.z = radius * Math.sin(angle);
    camera.lookAt(0, 0, 0);
    scrollRotationSpeed *= dampingFactor;
  }

  // Animate the scene
  function animate() {
    requestAnimationFrame(animate);
    updateCameraPosition();
    composer.render();
  }
  animate();

  // Window resize event handler
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  // Event listener setup for click and hover interactions
  loader.load("assets/models/volc.glb", function (gltf) {
    const object = gltf.scene;
    object.scale.set(10, 10, 10);
    scene.add(object);
    setupInteraction(object);
  });

  function setupInteraction(object) {
    object.traverse((child) => {
      if (child.isMesh) child.userData.clickable = true;
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function handleMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      document.body.style.cursor = intersects.some(
        (intersect) => intersect.object.userData.clickable
      )
        ? "pointer"
        : "default";
    }

    function handleClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.some((intersect) => intersect.object.userData.clickable)) {
        showOverlay();
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
  }
} else {
  // Fallback for unsupported WebGL
  hwainstructions.style.display = "block";
  const fallbackImage = document.createElement("img");
  fallbackImage.src = "assets/imgs/volcano.png";
  fallbackImage.id = "fallback-volcano";
  document.body.appendChild(fallbackImage);
  fallbackImage.addEventListener("click", showOverlay);
}

// =================== Playlist Setup ===================
//API Key is orgin restricted.
const API_KEY = "AIzaSyB58fVAN2Q2P3z3kLwI_KnPX7rs20TTMDA";
const API_ID =
  "491927014195-cve61bomorg41tg8k51n9hv4etpjglne.apps.googleusercontent.com";
const PLAYLIST_ID = "PLZG0CvngYU9i8BQVur9DtUyOGOALdtorK";

let index = 0;
const playlistItems = [];
const playlist = document.getElementById("playlist");

// Initialize Google API client
function initAPIClient() {
  gapi.load("client:auth2", function () {
    gapi.auth2.init({ client_id: API_ID });
    loadClient().then(getPlaylistItems);
  });
}

function loadClient() {
  gapi.client.setApiKey(API_KEY);
  return gapi.client
    .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(
      () => console.log("GAPI client loaded for API"),
      (err) => console.error("Error loading GAPI client", err)
    );
}

// Fetch playlist items from YouTube API
function getPlaylistItems(pageToken) {
  gapi.client.youtube.playlistItems
    .list({
      part: "snippet,contentDetails",
      maxResults: 200,
      playlistId: PLAYLIST_ID,
      pageToken,
    })
    .then(
      (response) => {
        const { items, nextPageToken } = response.result;
        items.forEach((item) =>
          playlist.appendChild(createPlaylistItem(item, index++))
        );
        if (nextPageToken) getPlaylistItems(nextPageToken);
      },
      (err) => console.error("Error fetching playlist items", err)
    );
}

// Create playlist item element
function createPlaylistItem(item, index) {
  const playlistItem = document.createElement("div");
  playlistItem.classList.add("playlist-item");
  playlistItem.style.backgroundImage = `url(https://i.ytimg.com/vi/${item.snippet.resourceId.videoId}/mqdefault.jpg)`;

  const title = document.createElement("div");
  title.classList.add("title");
  title.textContent = item.snippet.title;
  playlistItem.appendChild(title);

  playlistItem.addEventListener("click", () => {
    window.open(
      `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}&list=${PLAYLIST_ID}&index=${index}`,
      "_blank"
    );
  });

  return playlistItem;
}

initAPIClient();

// Playlist horizontal scroll
playlist.addEventListener("wheel", function (event) {
  event.preventDefault();
  playlist.scrollLeft +=
    event.deltaY > 0 ? playlist.offsetWidth * 0.5 : -playlist.offsetWidth * 0.5;
});
