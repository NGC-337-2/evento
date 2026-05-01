import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';

export default function DashboardLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F1F5F9] dark:bg-secondary-950 transition-colors">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <DashboardHeader />

                <main className="p-4 md:p-6 2xl:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
