import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Metodologia from './pages/Metodologia'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/metodologia" element={<Metodologia />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;