import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
// import { Web3Provider } from './providers/Web3Provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      {/* <Web3Provider> */}
        <App />
      {/* </Web3Provider> */}
    </Provider>
  </StrictMode>,
)
