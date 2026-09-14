import { Header } from "./Header";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  modelCount?: number;
  providerCount?: number;
}

export function MainLayout({ children, modelCount, providerCount }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-14">{children}</main>
      <Footer modelCount={modelCount} providerCount={providerCount} />
    </div>
  );
}