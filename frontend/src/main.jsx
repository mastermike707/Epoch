import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-west-1', // e.g., 'us-east-1'
    userPoolId: 'us-west-1_eHInUhXbJ', // e.g., 'us-east-1_XXXXXXXXX'
    userPoolWebClientId: '456m1saucom7n0kolk703qfcv9', // e.g., 'XXXXXXXXX'
    oauth: {
      domain: 'https://master.d3n9cjcfivdqga.amplifyapp.com', // e.g., 'your-app.auth.us-east-1.amazoncognito.com'
      clientId: '456m1saucom7n0kolk703qfcv9',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://localhost:5173/', // Your redirect URI
      redirectSignOut: 'http://localhost:5173/', // Your redirect URI
      responseType: 'code' // or 'token', depending on your configuration
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
