export const AuthBuildMarker = () => {
  const buildHash = import.meta.env.VITE_COMMIT_HASH || "08bde33";
  const buildTime = new Date().toISOString().slice(0, 10);
  
  return (
    <div className="text-center text-xs text-white/30 mt-4">
      Build: {buildHash} ({buildTime})
    </div>
  );
};
