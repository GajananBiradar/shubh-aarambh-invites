export const SkeletonTemplateCard = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border">
    <div className="h-72 bg-muted animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-6 bg-muted rounded-lg animate-pulse w-3/4" />
      <div className="h-4 bg-muted rounded-lg animate-pulse w-full" />
      <div className="flex gap-3 mt-4">
        <div className="flex-1 h-10 bg-muted rounded-xl animate-pulse" />
        <div className="flex-1 h-10 bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonTemplateCard key={i} />
    ))}
  </div>
);
