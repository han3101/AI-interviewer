import DashboardSidebar from './(components)/DashboardSideBar'
import DashboardNavBar from './(components)/DashboardNavBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='grid min-h-screen w-full lg:grid-cols-[280px_1fr]'>
        {/* Dashboard Sidebar */}
        <DashboardSidebar />
        {/* Dashboard Navbar */}
        <DashboardNavBar>
            <main className='flex flex-col gap-4 p-4 lg:gap-6'>
                {children}
            </main>
        </DashboardNavBar>
    </div>
  );
}