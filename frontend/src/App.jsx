import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Metodologia from './pages/Metodologia'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/metodologia" element={<Metodologia />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App