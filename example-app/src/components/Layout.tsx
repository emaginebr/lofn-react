import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="grain min-h-screen bg-background transition-colors">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
