import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import StreakCard from "@/components/StreakCard";
import XpCard from "@/components/XpCard";
import ActivityGrid from "@/components/ActivityGrid";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-8 space-y-6">
        <ProfileCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StreakCard />
          <XpCard />
        </div>
        <ActivityGrid />
      </main>
    </div>
  );
};

export default Dashboard;
