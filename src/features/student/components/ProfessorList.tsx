import { useState } from 'react';
import { useProfessors } from '../hooks/useProfessors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { SkeletonList } from '@/app/components/ui/loading';
import { EmptyState } from '@/app/components/ui/empty-state';
import { Search, User, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

export function ProfessorList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: professors, isLoading } = useProfessors(searchTerm);
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : professors && professors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professors.map((prof) => (
            <Card key={prof.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {prof.profile ? getInitials(prof.profile.full_name) : 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {prof.profile?.full_name}
                    </CardTitle>
                    {prof.department && (
                      <CardDescription className="text-sm truncate">
                        {prof.department}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <div className="flex-1 space-y-3">
                  {prof.department && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{prof.department}</span>
                    </div>
                  )}
                  {prof.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {prof.bio}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => navigate(`/student/professors/${prof.id}`)}
                  className="w-full mt-auto"
                  size="sm"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<User className="h-12 w-12 text-muted-foreground" />}
          title="No professors found"
          description={
            searchTerm
              ? 'Try adjusting your search criteria'
              : 'No professors available at the moment'
          }
        />
      )}
    </div>
  );
}
