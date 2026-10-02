const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.cert(serviceAccount)
});

async function setAdminRole() {
  const email = 'hamzaali5236@gmail.com'; // Aapka admin email
  try {
    const user = await getAuth().getUserByEmail(email);
    await getAuth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Success! ${email} ko admin bana diya gaya hai.`);
    console.log('Ab website par sign out kar ke dobara sign in karo.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin claim:', error.message || error);
    process.exit(1);
  }
}

setAdminRole();
