export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ padding: '1.5rem', maxWidth: '1536px', marginLeft: 'auto', marginRight: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
