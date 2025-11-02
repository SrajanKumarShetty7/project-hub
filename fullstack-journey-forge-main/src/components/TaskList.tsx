import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Calendar, Folder } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TaskListProps {
  userId: string;
}

const statusColors: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary text-primary-foreground",
  review: "bg-accent text-accent-foreground",
  done: "bg-success text-success-foreground",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary text-primary-foreground",
  high: "bg-accent text-accent-foreground",
  urgent: "bg-destructive text-destructive-foreground",
};

export const TaskList = ({ userId }: TaskListProps) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading tasks");
    } else {
      setTasks(data || []);
      
      // Fetch associated projects
      const projectIds = [...new Set(data?.map((t) => t.project_id))];
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, title")
        .in("id", projectIds);
      
      const projectsMap = (projectsData || []).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, any>);
      
      setProjects(projectsMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const handleDelete = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      toast.error("Error deleting task");
    } else {
      toast.success("Task deleted successfully");
      fetchTasks();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow animate-slide-up">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-base">{task.title}</CardTitle>
                {task.description && (
                  <CardDescription className="line-clamp-1">{task.description}</CardDescription>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap items-center">
              <Badge className={statusColors[task.status]}>{task.status}</Badge>
              <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
              {projects[task.project_id] && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Folder className="w-3 h-3 mr-1" />
                  {projects[task.project_id].title}
                </div>
              )}
            </div>
            {task.due_date && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Due: {format(new Date(task.due_date), "MMM dd, yyyy")}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
