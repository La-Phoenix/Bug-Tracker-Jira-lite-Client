export const SidePanel = () => (
  <div className="w-full md:flex-1 bg-[#1f2630] text-white px-6 py-10 md:p-10 flex flex-col justify-center items-center relative overflow-hidden">
    <div className="z-10 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">🐛 BugTracker Pro</h1>
      <p className="text-lg opacity-90">Track, manage, and resolve issues with precision and efficiency</p>
    </div>
    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-[spin_20s_linear_infinite]" />
  </div>
);
