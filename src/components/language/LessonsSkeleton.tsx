import { Skeleton } from "../ui/skeleton";

export function LessonSkeleton() {
    return (
      <div className="space-y-4">
        {/* Lesson cards */}
        {[1, 2, 3, 4 , 5].map((i) => (
          <div
            key={i}
            className="p-3 bg-background/50 border border-foreground/10 rounded-lg space-y-3"
          >
            <Skeleton className="h-4 w-3/4" /> {/* question */}
            <Skeleton className="h-3 w-1/2" /> {/* maybe speech tag */}
          </div>
        ))}
  
        {/* Show Answer button */}
        <Skeleton className="h-10 w-32 rounded-md" />
  
        {/* Navigation buttons */}
        <div className="flex w-full justify-between items-center gap-3 mt-20">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    );
  }
  