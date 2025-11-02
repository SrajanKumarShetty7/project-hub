import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  userId: string;
}

export const StatsCards = ({ userId }: StatsCardsProps) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch projects
      const { data: projects } = await supabase
        .from("projects")
        .select("status")
        .eq("user_id", userId);

      // Fetch tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("user_id", userId);

      setStats({
        totalProjects: projects?.length || 0,
        completedProjects: projects?.filter((p) => p.status === "completed").length || 0,
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter((t) => t.status === "done").length || 0,
      });
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  const statsData = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: Briefcase,
      color: "text-primary",
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      title: "Active Tasks",
      value: stats.totalTasks - stats.completedTasks,
      icon: Clock,
      color: "text-accent",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "text-success",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="glass-dark shadow-md hover:shadow-lg transition-shadow animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
