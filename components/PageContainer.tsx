type PageContainerProps = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  return <section className="mx-auto max-w-7xl p-6">{children}</section>;
}