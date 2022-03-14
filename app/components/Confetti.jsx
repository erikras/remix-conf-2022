export function Confetti() {
  return (
    <div className="confetti-wrapper z-0">
      {[...Array(1000)].map((_, i) => (
        <div key={i} className={`confetti-${i} z-0`} />
      ))}
    </div>
  );
}
