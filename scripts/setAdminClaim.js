/**
 * setAdminClaim.js
 * 
 * This script sets a custom claim on a Firebase Auth user to grant them admin access.
 * 
 * Usage:
 *   1. Set up Firebase Admin SDK credentials:
 *      - Go to Firebase Console > Project Settings > Service Accounts
 *      - Click "Generate new private key"
 *      - Save the JSON file securely
 *   
 *   2. Set the environment variable:
 *      - Linux/Mac: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
 *      - Windows: set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
 *   
 *   3. Run the script:
 *      node scripts/setAdminClaim.js <user-uid>
 * 
 * Example:
 *   node scripts/setAdminClaim.js abc123def456
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Uses GOOGLE_APPLICATION_CREDENTIALS environment variable
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

/**
 * Set admin claim on a user
 * @param {string} uid - The Firebase Auth user UID
 */
async function setAdminClaim(uid) {
  if (!uid) {
    console.error('Error: User UID is required');
    console.error('Usage: node scripts/setAdminClaim.js <user-uid>');
    process.exit(1);
  }

  try {
    // Verify the user exists
    const user = await admin.auth().getUser(uid);
    console.log(`Found user: ${user.email || user.uid}`);
    console.log(`Current custom claims: ${JSON.stringify(user.customClaims) || 'none'}`);

    // Set the admin custom claim
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    // Verify the claim was set
    const updatedUser = await admin.auth().getUser(uid);
    console.log(`\nAdmin claim set successfully!`);
    console.log(`Updated custom claims: ${JSON.stringify(updatedUser.customClaims)}`);
    console.log(`\nUser ${uid} now has admin access to the dashboard.`);
    console.log(`\nNote: The user must sign out and sign back in for the claim to take effect.`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`Error: User with UID "${uid}" not found`);
      console.error('Make sure the user has signed up before running this script.');
    } else {
      console.error('Error setting admin claim:', error.message);
    }
    process.exit(1);
  }
}

// Get UID from command line arguments
const uid = process.argv[2];
setAdminClaim(uid)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });