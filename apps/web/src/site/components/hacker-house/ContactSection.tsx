"use client";

// Email is assembled in JS (never emitted as a plain address or mailto: in the
// server-rendered HTML) to reduce scraping by spam bots.
const EMAIL_USER = "summerschool";
const EMAIL_DOMAIN = "aifoundations.school";

export function ContactSection() {
  const openEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${EMAIL_USER}@${EMAIL_DOMAIN}`;
  };

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="container">
        <div className="border-t mt-12 px-6 md:px-12 pt-12 pb-12 text-center">
          <h2 className="hh-contact font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Learn more
          </h2>
          <p className="hh-contact text-lg text-muted-foreground leading-relaxed">
            Have a question or want to hear more about the AI Summer School? Send
            us{" "}
            <a
              href="#"
              onClick={openEmail}
              className="font-medium text-foreground underline underline-offset-4 transition-opacity duration-200 hover:opacity-70"
            >
              an email
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
