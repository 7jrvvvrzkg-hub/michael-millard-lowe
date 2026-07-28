export default function Loading() {
  const skeletons = Array.from({ length: 8 });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-56 animate-pulse rounded-lg bg-espresso-100" />
      <div className="listing-grid">
        {skeletons.map((_, i) => (
          <div key={i}>
            <div
              className="aspect-square rounded-xl bg-espresso-100 bg-[length:400px_100%] bg-no-repeat animate-shimmer"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(0,0,0,0) 0, rgba(0,0,0,0.04) 40px, rgba(0,0,0,0) 80px)",
              }}
            />
            <div className="mt-2.5 h-3 w-4/5 rounded bg-espresso-100" />
            <div className="mt-2 h-3 w-1/3 rounded bg-espresso-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
