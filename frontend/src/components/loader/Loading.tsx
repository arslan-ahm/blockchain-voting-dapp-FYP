export const Loading = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="text-lg text-muted-foreground">{message}</div>
      </div>
    </div>
  );
};
