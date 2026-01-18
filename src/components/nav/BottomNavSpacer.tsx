export const BottomNavSpacer = () => {
  return (
    <div
      className="h-36 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden="true"
    />
  );
};
