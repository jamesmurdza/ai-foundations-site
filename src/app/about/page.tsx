import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Brain, Code, CircuitBoard } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="py-20 border-b">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
                About AI Foundations
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We are on a mission to democratize AI education by teaching the
                fundamentals from the ground up.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-heading font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  At AI Foundations, we believe that understanding AI shouldn't be
                  reserved for those with advanced degrees in mathematics or
                  computer science. Our goal is to break down complex concepts
                  into digestible, first-principles-based lessons.
                </p>
                <p className="text-lg text-muted-foreground">
                  We focus on practical, hands-on learning that empowers students
                  to not just use AI tools, but to understand how they work and
                  how to build them.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 border rounded-xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">First Principles</h3>
                    <p className="text-sm text-muted-foreground">
                      We teach the "why" behind the "how", ensuring a deep
                      understanding of AI concepts.
                    </p>
                  </div>
                </div>
                <div className="p-6 border rounded-xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Code className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Practical Engineering</h3>
                    <p className="text-sm text-muted-foreground">
                      Our curriculum is designed for real-world application and
                      software engineering best practices.
                    </p>
                  </div>
                </div>
                <div className="p-6 border rounded-xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <CircuitBoard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Community Driven</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn alongside a community of passionate builders and
                      get mentorship from industry experts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-heading font-bold mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-6">
                AI Foundations started as a collaboration between Naveed Khan and
                James Murdza. Both recognized a gap in AI education: it was
                either too academic or too superficial.
              </p>
              <p className="text-lg text-muted-foreground">
                They decided to create a school that combines the rigour of
                machine learning research with the practicality of software
                engineering, making it accessible to anyone with a passion for
                building.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
