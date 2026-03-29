import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { type User, type CommitDay } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [commits, setCommits] = useState<CommitDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function fetchProfileData() {
      if (!user?.id) {
        setProfile(null);
        setCommits([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (isMounted) setProfile(profileData);

        // Fetch recent commits (last 14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        
        const { data: commitData, error: commitError } = await supabase
          .from("commits")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", fourteenDaysAgo.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (commitError) throw commitError;
        
        if (isMounted) {
          // Fill in missing days with 0 commits
          const filledCommits: CommitDay[] = [];
          for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const existing = commitData?.find(c => c.date === dateStr);
            filledCommits.push({
              date: dateStr,
              commit_count: existing ? existing.commit_count : 0
            });
          }
          setCommits(filledCommits);
        }

      } catch (err) {
        console.error("Error fetching profile data:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return { profile, commits, loading, error };
}
