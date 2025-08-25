import { createRoot } from 'react-dom/client'
import './App.css'
import './App.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { DeviceProvider } from './contexts/DeviceContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  
    <ThemeProvider>
        <DeviceProvider>
            <BrowserRouter basename="/orientationassessment">
            <App />
            </BrowserRouter>
        </DeviceProvider>
    </ThemeProvider>
,
)
