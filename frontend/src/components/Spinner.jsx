const Spinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-secondary-200 dark:border-secondary-700"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

export default Spinner;
