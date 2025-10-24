import './globals.css'; // Import the global CSS file
import React from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-800 text-white p-4">
            <div className="text-2xl font-bold mb-8">Admin Panel</div>
            <nav>
              <ul>
                <li className="mb-2">
                  <Link href="/" className="block p-2 rounded hover:bg-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/users" className="block p-2 rounded hover:bg-gray-700">
                    User Management
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/goals" className="block p-2 rounded hover:bg-gray-700">
                    Goal Management
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/accountability" className="block p-2 rounded hover:bg-gray-700">
                    Accountability
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/moderation" className="block p-2 rounded hover:bg-gray-700">
                    Verification & Moderation
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/notifications" className="block p-2 rounded hover:bg-gray-700">
                    Notifications
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/analytics" className="block p-2 rounded hover:bg-gray-700">
                    Analytics & Reports
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/content" className="block p-2 rounded hover:bg-gray-700">
                    Content Management
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/settings" className="block p-2 rounded hover:bg-gray-700">
                    System Configuration
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/developer" className="block p-2 rounded hover:bg-gray-700">
                    Developer Controls
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <header className="bg-white shadow p-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">Commitly Admin</h1>
              {/* Add admin specific header elements here, e.g., logout button, admin name */}
              <div>
                <span className="text-gray-700">Welcome, Admin!</span>
                {/* <button className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Logout</button> */}
              </div>
            </header>
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
};

export default AdminLayout;
