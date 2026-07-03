// Saf CSS animasyonu kullanır, JavaScript'e bağımlı değildir — bu yüzden
// hiçbir client tarafı kod çalıştırmasa bile içerik daima tam görünür kalır.
export default function Reveal({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  return (
    <div className={`reveal ${className}`} style={{ animationDelay: `${delayMs}ms` }}>
      {children}
    </div>
  );
}
