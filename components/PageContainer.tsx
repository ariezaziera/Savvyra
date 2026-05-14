// PageContainer.tsx
type PageContainerProps = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <section className="mx-auto w-full max-w-450 px-4 py-6 sm:px-6 xl:px-8">
      {children}
    </section>
  );
}