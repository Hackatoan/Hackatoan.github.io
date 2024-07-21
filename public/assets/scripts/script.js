//css stuff

//3d background render
// Set up the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

// Set up the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const radius = 20;
let angle = 0;
const baseRotationSpeed = 0.0001; // Base rotation speed
let scrollRotationSpeed = 0; // Additional rotation speed from scroll
const maxRotationSpeed = 0.01; // Maximum speed limit
const dampingFactor = 0.98; // Damping factor for slowing down

camera.position.set(radius, 10, 0); // Initial position
camera.lookAt(0, 0, 0); // Look at the center of the model

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-50, 50, -50);
directionalLight2.castShadow = true;
scene.add(directionalLight2);

// Load the .glb file
const loader = new THREE.GLTFLoader();
loader.load(
  "assets/models/volc.glb",
  function (gltf) {
    const object = gltf.scene;
    object.scale.set(10, 10, 10); // Adjust scale if needed
    object.position.set(0, 0, 0); // Adjust position if needed
    scene.add(object);
  },
  undefined,
  function (error) {
    console.error("An error happened:", error);
  }
);

// Post-processing
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

const unrealBloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.3,
  0.1,
  0.1 // Toned down bloom effect
);
unrealBloomPass.threshold = 0;
unrealBloomPass.strength = 0.3; // Reduced bloom strength
unrealBloomPass.radius = 0.1; // Reduced bloom radius
composer.addPass(unrealBloomPass);

const shaderPass = new THREE.ShaderPass(THREE.CopyShader);
composer.addPass(shaderPass);

// Handle scroll event to adjust rotation speed
window.addEventListener("wheel", function (event) {
  scrollRotationSpeed += event.deltaY * 0.0005; // Adjust rotation speed based on scroll
  if (scrollRotationSpeed > maxRotationSpeed) {
    scrollRotationSpeed = maxRotationSpeed;
  } else if (scrollRotationSpeed < -maxRotationSpeed) {
    scrollRotationSpeed = -maxRotationSpeed;
  }
});

// Update camera position
function updateCameraPosition() {
  angle += baseRotationSpeed + scrollRotationSpeed; // Update angle based on combined rotation speed
  camera.position.x = radius * Math.cos(angle);
  camera.position.z = radius * Math.sin(angle);
  camera.lookAt(0, 0, 0); // Keep the camera looking at the center of the model

  // Apply damping to scrollRotationSpeed to gradually slow down to base speed
  scrollRotationSpeed *= dampingFactor;
  if (Math.abs(scrollRotationSpeed) < 0.0001) {
    scrollRotationSpeed = 0; // Stop completely when very slow
  }
}

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  updateCameraPosition();
  composer.render();
}
animate();

// Handle window resize
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
//music playlist

//yt playlist
const API_KEY = "AIzaSyB58fVAN2Q2P3z3kLwI_KnPX7rs20TTMDA";
const API_ID =
  "491927014195-cve61bomorg41tg8k51n9hv4etpjglne.apps.googleusercontent.com";
const PLAYLIST_ID = "PLZG0CvngYU9i8BQVur9DtUyOGOALdtorK";

var videoVisible = 0;
var amount = 0;

const playlistItems = [];
const playlist = document.getElementsByClassName("playlist")[0];

// From Google API Docs
function initAPIClient() {
  gapi.load("client:auth2", function () {
    gapi.auth2.init({ client_id: API_ID });
    loadClient().then(getPlaylistItems);
  });
}

// From Google API Docs
function loadClient() {
  gapi.client.setApiKey(API_KEY);
  return gapi.client
    .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(
      function () {
        console.log("GAPI client loaded for API");
      },
      function (err) {
        console.error("Error loading GAPI client for API", err);
      }
    );
}
var index = 0;

function getPlaylistItems(pageToken) {
  return gapi.client.youtube.playlistItems
    .list({
      part: "snippet,contentDetails",
      maxResults: 200, // This is the maximum available value, according to the google docs
      playlistId: PLAYLIST_ID,
      pageToken,
    })
    .then(
      function (response) {
        const { items, nextPageToken } = response.result;

        // The items[] is an array of a playlist items.
        // nextPageToken - if empty - there are no items left to fetch

        playlistItems.push(...items);

        // It's up to you, how to handle the item from playlist.
        // Add `onclick` events to navigate to another video, or use another thumbnail image quality

        items.forEach(function (item) {
          const thumbnailItem = createPlaylistItem(item, index);
          playlist.appendChild(thumbnailItem);
          index++;
          amount++;
        });

        // Recursively get another portion of items, if there any left
        if (nextPageToken) {
          getPlaylistItems(nextPageToken);
        }
      },
      function (err) {
        console.error("Execute error", err);
      }
    );
}

// Existing CSS and 3D model rendering setup...

// Reference to the overlay
const overlay = document.getElementById("overlay");
const instructions = document.getElementById("instruction-text");

// Function to show the overlay
function showOverlay() {
  overlay.classList.remove("hidden");
  overlay.style.display = "block"; // Ensure it is displayed
  setTimeout(() => {
    instructions.style.display = "none";
    overlay.classList.add("visible");
  }, 10); // Small delay to trigger the transition
}

// Function to hide the overlay
function hideOverlay() {
  overlay.classList.remove("visible");
  overlay.classList.add("hidden");
  setTimeout(() => {
    instructions.style.display = "block";
    overlay.style.display = "none";
  }, 500); // Match the transition duration
}

// Add event listener to the volcano model
loader.load(
  "assets/models/volc.glb",
  function (gltf) {
    if (overlay.style.display == "block") {
      return;
    }

    const object = gltf.scene;
    object.scale.set(10, 10, 10); // Adjust scale if needed
    object.position.set(0, 0, 0); // Adjust position if needed
    scene.add(object);

    // Add click event to the object
    object.traverse((child) => {
      if (child.isMesh) {
        child.userData.clickable = true;
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.userData.clickable) {
          showOverlay();
        }
      }
    }

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      let isHovering = false;
      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.userData.clickable) {
          isHovering = true;
        }
      }
      document.body.style.cursor = isHovering ? "pointer" : "default";
    }

    window.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMouseMove);
  },
  undefined,
  function (error) {
    console.error("An error happened:", error);
  }
);

// Add event listener for the ESC key
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

// Rest of the existing code...

function createPlaylistItem(i, index) {
  var changeIndex = index;
  const item = document.createElement("div");
  item.classList.add("playlist-item");
  item.classList.add("button");
  item.style.background = `url(https://i.ytimg.com/vi/${i.snippet.resourceId.videoId}/mqdefault.jpg) no-repeat center`;
  item.style.backgroundSize = "contain";
  item.id = index.toString();
  item.addEventListener("click", function () {
    const win = window.open(
      "https://www.youtube.com/watch?v=" +
        `${i.snippet.resourceId.videoId}` +
        "&list=PLZG0CvngYU9i8BQVur9DtUyOGOALdtorK&index=" +
        changeIndex.toString(),
      "_blank"
    );
    win.focus();
  });
  return item;
}

// Before doing any action with the API ->
initAPIClient();
function goUp(button, delay) {
  button.disabled = true;
  if (videoVisible > 0) {
    document.getElementById("btndown").innerHTML = "RIGHT";
    videoVisible--;
    document.getElementById(videoVisible.toString()).style.width = "100%";
  }
  setTimeout(() => {
    button.disabled = false;
  }, delay); // delay is in seconds, so multiply by 1000 to convert to milliseconds
}
function goDown(button, delay) {
  button.disabled = true;
  if (videoVisible < amount - 4) {
    document.getElementById(videoVisible.toString()).style.width = "0px";
    videoVisible++;
  }

  if (document.getElementById("btndown").innerHTML == "View Full Playlist") {
    window.open(
      "https://www.youtube.com/playlist?list=PLZG0CvngYU9i8BQVur9DtUyOGOALdtorK"
    );
  }
  if (videoVisible > amount - 5) {
    document.getElementById("btndown").innerHTML = "View Full Playlist";
  }
  if (videoVisible > amount - 10) {
    delay = delay * 3;
  }
  setTimeout(() => {
    button.disabled = false;
  }, delay); // delay is in seconds, so multiply by 1000 to convert to milliseconds
}
