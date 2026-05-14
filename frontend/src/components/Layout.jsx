import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'  // se tiver

export default function Layout() {
  return (
    <div className="app">
      <Header />
      <Outlet />  {/* Aqui entram as páginas (Home, Sobre, Metodologia) */}
      <Footer />
    </div>
  )
}