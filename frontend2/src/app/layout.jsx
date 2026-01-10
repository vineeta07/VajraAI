import { Outlet } from 'react-router-dom';
import Sidebar from './../components/Sidebar';
import Navbar from './../components/Navbar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Fixed Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Fixed Navbar at the top of the main area */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <Navbar />
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;