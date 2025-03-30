// A simple script to inject environment variables into client-side JS files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to firebase-config.js
const firebaseConfigPath = path.join(__dirname, '../public/js/firebase-config.js');

// Read the file
try {
  console.log(`Reading file: ${firebaseConfigPath}`);
  let content = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  // Replace placeholders with actual environment variables
  content = content.replace('${VITE_FIREBASE_API_KEY}', process.env.VITE_FIREBASE_API_KEY || '');
  content = content.replace('${VITE_FIREBASE_PROJECT_ID}', process.env.VITE_FIREBASE_PROJECT_ID || '');
  content = content.replace('${VITE_FIREBASE_APP_ID}', process.env.VITE_FIREBASE_APP_ID || '');
  
  // Write the updated content back to the file
  fs.writeFileSync(firebaseConfigPath, content, 'utf8');
  console.log('Firebase configuration updated with environment variables');
} catch (error) {
  console.error('Error updating Firebase configuration:', error);
}