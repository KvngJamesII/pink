// Firebase configuration
const firebaseConfig = {
  apiKey: "", // Will be replaced at runtime
  projectId: "", // Will be replaced at runtime
  authDomain: "", // Will be constructed from projectId
  storageBucket: "", // Will be constructed from projectId
  appId: "" // Will be replaced at runtime
};

// Initialize Firebase - this will be executed when the page loads
function initializeFirebase() {
  // Inject environment variables
  firebaseConfig.apiKey = VITE_FIREBASE_API_KEY || "";
  firebaseConfig.projectId = VITE_FIREBASE_PROJECT_ID || "";
  firebaseConfig.authDomain = firebaseConfig.projectId ? `${firebaseConfig.projectId}.firebaseapp.com` : "";
  firebaseConfig.storageBucket = firebaseConfig.projectId ? `${firebaseConfig.projectId}.appspot.com` : "";
  firebaseConfig.appId = VITE_FIREBASE_APP_ID || "";
  
  // Check if we have all the required configuration
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    console.error("Firebase configuration is incomplete. Please check your environment variables.");
    showFirebaseSetupError();
    return null;
  }

  try {
    // Initialize Firebase
    return firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    showFirebaseSetupError(error.message);
    return null;
  }
}

// Function to display Firebase setup error
function showFirebaseSetupError(errorMessage = '') {
  const appElement = document.getElementById('app');
  if (!appElement) return;

  appElement.innerHTML = `
    <div class="container" style="padding-top: 2rem;">
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">QuicReF Setup Error</h1>
        </div>
        <div class="card-content">
          <div class="alert alert-error mb-4">
            <p>There was a problem initializing Firebase. Please refresh the page or contact support.</p>
            ${errorMessage ? `<p class="mt-2"><strong>Error:</strong> ${errorMessage}</p>` : ''}
          </div>
          
          <button class="btn btn-primary btn-block" onclick="window.location.reload()">
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  `;
}

// Placeholder global variables for Firebase environment
const VITE_FIREBASE_API_KEY = "AIzaSyAvbwXNN1yRBSiyDOG9Jru9jodPEgmJfrs";
const VITE_FIREBASE_PROJECT_ID = "1:196781817009:web:013596f70ac472d5d13690";
const VITE_FIREBASE_APP_ID = "quicref-68806";

// Initialize Firebase when the script loads
let app = null;
document.addEventListener('DOMContentLoaded', () => {
  app = initializeFirebase();
});