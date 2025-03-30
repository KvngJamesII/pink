# QuicReF - Task Marketplace with Referral System

QuicReF is a mobile-friendly task marketplace platform that allows users to create tasks for others to complete, earn money through task completion, and benefit from a referral system.

## Key Features

- **User Authentication**: Secure login/signup system powered by Firebase
- **Task Management**: Create, view, and complete tasks
- **Wallet System**: Fund wallet, withdraw money, and track transactions
- **Referral System**: Earn 25 naira for each referred user's successful deposit
- **My Tasks Section**: Review submissions for created tasks and track your own submissions
- **Admin Panel**: Manage users, approve/reject deposits and withdrawals

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript with Mobile-responsive design
- **Backend**: Node.js, Express
- **Authentication**: Firebase Authentication
- **Database**: In-memory data storage (can be extended to use Firebase Firestore)

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Firebase:
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication with Google sign-in
   - Add your app's domain to authorized domains
   - Copy your Firebase config (apiKey, projectId, appId) to environment variables
4. Start the application: `npm run dev`

## Admin Access

- **Email**: mike@gmail.com
- **Password**: 

## User Workflow

1. Register a new account (with optional referral code)
2. Fund your wallet (admin must approve deposits)
3. Create tasks or complete tasks created by others
4. Submit proof of task completion
5. Task creators review and approve/reject submissions
6. Withdraw earnings to external account (admin must approve)

## Screenshots

[Screenshots would be included here]

## License

[Your license information]

## Contributors

[List of contributors]
