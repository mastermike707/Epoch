import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-west-1',
    userPoolId: 'us-west-1_eHInUhXbJ',
    userPoolWebClientId: '456m1saucom7n0kolk703qfcv9',
    oauth: {
      domain: 'https://master.d3n9cjcfivdqga.amplifyapp.com',
      clientId: '456m1saucom7n0kolk703qfcv9',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://localhost:5173/',
      redirectSignOut: 'http://localhost:5173/',
      responseType: 'code'
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
