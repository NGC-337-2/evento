export const Skeleton = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-md bg-secondary-200 dark:bg-secondary-700 ${className}`}
  ></div>
);

export const InlineSpinner = ({ className = 'h-5 w-5', text }) => (
  <div className="flex items-center justify-center gap-2">
    <svg
      className={`animate-spin text-primary-600 dark:text-primary-500 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    {text && (
      <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
        {text}
      </span>
    )}
  </div>
);

const Spinner = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? 'fixed inset-0 z-50 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm' : 'min-h-[200px]'}`}
    >
      <InlineSpinner className="h-10 w-10" />
    </div>
  );
};

export default Spinner;
