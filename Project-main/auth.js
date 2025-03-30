// Auth module for handling authentication with Firebase
const Auth = (function() {
  // Save the current user
  let currentUser = null;
  let isAdmin = false;
  
  // Listeners for auth state changes
  const authStateListeners = [];
  
  // Initialize auth system
  function init() {
    // Set up Firebase auth listener
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userData = await getUserData(user.uid);
          currentUser = {
            uid: user.uid,
            email: user.email,
            ...userData
          };
          
          // Check if user is admin
          isAdmin = currentUser.email === 'mike@gmail.com';
          currentUser.isAdmin = isAdmin;
          
          console.log('User authenticated:', currentUser.email);
        } catch (error) {
          console.error('Error getting user data:', error);
          currentUser = {
            uid: user.uid,
            email: user.email,
            walletBalance: 0,
            withdrawableBalance: 0,
            referralCode: '',
            isAdmin: isAdmin
          };
        }
      } else {
        // User is signed out
        currentUser = null;
        isAdmin = false;
        console.log('User signed out');
      }
      
      // Notify listeners
      notifyAuthStateChanged();
    });
  }
  
  // Get user data from Firestore
  async function getUserData(uid) {
    const db = firebase.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      // Create user document if it doesn't exist
      const newUser = {
        walletBalance: 0,
        withdrawableBalance: 0,
        referralCode: generateReferralCode(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('users').doc(uid).set(newUser);
      return newUser;
    }
  }
  
  // Generate referral code
  function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  // Register user with email and password
  async function register(email, password, referredBy = null) {
    try {
      // Create user account
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const db = firebase.firestore();
      const userData = {
        walletBalance: 0,
        withdrawableBalance: 0,
        referralCode: generateReferralCode(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add referral data if provided
      if (referredBy) {
        // Check if referral code exists
        const referralQuery = await db.collection('users')
          .where('referralCode', '==', referredBy)
          .limit(1)
          .get();
          
        if (!referralQuery.empty) {
          const referrer = referralQuery.docs[0];
          const referrerId = referrer.id;
          
          // Add referral record
          await db.collection('referrals').add({
            referrerId: referrerId,
            referredId: user.uid,
            referredEmail: email,
            status: 'pending', // Will be updated when user completes first task
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          // Add this info to the user data
          userData.referredBy = referrerId;
        }
      }
      
      // Save user data
      await db.collection('users').doc(user.uid).set(userData);
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Login with email and password
  async function login(email, password) {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Logout user
  async function logout() {
    try {
      await firebase.auth().signOut();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Add auth state change listener
  function onAuthStateChanged(listener) {
    authStateListeners.push(listener);
    
    // Immediately call with current state
    if (currentUser) {
      listener(currentUser);
    } else {
      listener(null);
    }
    
    // Return function to remove listener
    return () => {
      const index = authStateListeners.indexOf(listener);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }
  
  // Notify all listeners of auth state change
  function notifyAuthStateChanged() {
    authStateListeners.forEach(listener => listener(currentUser));
  }
  
  // Get current user
  function getCurrentUser() {
    return currentUser;
  }
  
  // Check if user is admin
  function isUserAdmin() {
    return isAdmin;
  }
  
  // Update user wallet balance
  async function updateUserWallet(amount, isWithdrawable = false) {
    if (!currentUser) return { success: false, error: 'User not authenticated' };
    
    try {
      const db = firebase.firestore();
      const userRef = db.collection('users').doc(currentUser.uid);
      
      // Update the right balance
      if (isWithdrawable) {
        await userRef.update({
          withdrawableBalance: firebase.firestore.FieldValue.increment(amount)
        });
        currentUser.withdrawableBalance += amount;
      } else {
        await userRef.update({
          walletBalance: firebase.firestore.FieldValue.increment(amount)
        });
        currentUser.walletBalance += amount;
      }
      
      // Notify listeners of update
      notifyAuthStateChanged();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating wallet:', error);
      return { success: false, error: error.message };
    }
  }
  
  return {
    init,
    register,
    login,
    logout,
    getCurrentUser,
    isUserAdmin,
    onAuthStateChanged,
    updateUserWallet
  };
})();

// Initialize auth when document is loaded
document.addEventListener('DOMContentLoaded', Auth.init);