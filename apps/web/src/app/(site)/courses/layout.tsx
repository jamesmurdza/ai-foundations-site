import { Header } from "@site/components/header";
import { Footer } from "@site/components/footer";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
