import { Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "./card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  icon = <Calendar className="h-12 w-12 text-muted-foreground" />, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  );
}
