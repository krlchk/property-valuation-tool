interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner = ({ label = "Loading..." }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-custom-yellow" />
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
};