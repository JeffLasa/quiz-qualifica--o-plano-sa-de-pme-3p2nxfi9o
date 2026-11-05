import { Outlet, useLocation } from 'react-router-dom'
import { Header, Footer } from './HeaderFooter'

export default function Layout() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/leads')

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F8FC] selection:bg-[#E3F0FA] selection:text-[#0066B2]">
      {!isDashboard && <Header />}
      <main className="flex-1 flex flex-col justify-start">
        <Outlet />
      </main>
      {!isDashboard && <Footer />}
    </div>
  )
}
