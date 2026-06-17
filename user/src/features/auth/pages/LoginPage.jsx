import LoginForm from "../components/LoginForm";

function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-background font-body-md overflow-x-hidden">
      {/* Brand/Typography Sidebar (Hidden on Mobile) */}
      <section className="hidden md:flex relative w-1/2 bg-surface-container overflow-hidden">
        {/* Ghost Text Background */}
        <div className="absolute -left-12 top-1/4 opacity-5 select-none pointer-events-none">
          <span className="font-display-bg-ghost text-display-bg-ghost text-charcoal">
            FUTURE
          </span>
        </div>
        <div className="absolute -right-12 bottom-1/4 opacity-5 select-none pointer-events-none">
          <span className="font-display-bg-ghost text-display-bg-ghost text-charcoal">
            LUXURY
          </span>
        </div>

        {/* Bold Typography Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-start justify-center p-margin-edge max-w-2xl mx-auto">
          <div className="space-y-4">
            <span className="font-label-caps text-label-caps text-secondary tracking-[0.3em] uppercase block">
              Established 2026
            </span>
            <h2 className="font-display-xl text-display-xl text-charcoal font-black uppercase tracking-tight">
              THE FUTURE <br />
              <span className="text-secondary">OF</span> <br />
              <span className="text-secondary">COMMERCE</span>
            </h2>
            <div className="w-24 h-1 bg-charcoal mt-8 mb-12"></div>
            <p className="font-headline-sm text-headline-sm text-charcoal/80 max-w-md uppercase tracking-wider">
              TRUSTKART PREMIUM
            </p>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mt-4 leading-relaxed">
              Experience the intersection of{" "}
              <span className="text-charcoal font-bold">Curated Luxury</span>{" "}
              and{" "}
              <span className="text-charcoal font-bold">Precision Tech</span>.
              Our seasonal collections are crafted for those who demand
              excellence in every detail.
            </p>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 right-0 p-12">
          <div className="w-16 h-16 border-r border-b border-secondary opacity-30"></div>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-margin-edge relative bg-surface-container-lowest min-h-screen">
        {/* Mobile Brand Logo */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 md:hidden">
          <span className="font-display-xl text-[32px] tracking-tight text-charcoal uppercase font-black">
            Trustkart
          </span>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}

export default LoginPage;
