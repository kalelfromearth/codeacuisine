// Copy this file to environment.ts and fill in the values from the Firebase console and your n8n server.
export const environment = {
  n8nWebhookUrl: 'https://YOUR_N8N_DOMAIN/webhook/code-a-cuisine/generate',
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
