import SignupForm from "../components/SignupForm";

function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-surface-container-low font-body-md overflow-x-hidden">
      {/* Brand/Typography Sidebar (Hidden on Mobile) */}
      <section className="hidden md:flex relative w-1/2 bg-surface-dim overflow-hidden">
        {/* Ghost Text Background */}
        <div className="absolute -left-12 top-1/4 opacity-10 select-none pointer-events-none">
          <span className="font-display-bg-ghost text-display-bg-ghost text-on-surface">
            FUTURE
          </span>
        </div>
        <div className="absolute -right-12 bottom-1/4 opacity-10 select-none pointer-events-none">
          <span className="font-display-bg-ghost text-display-bg-ghost text-on-surface">
            LUXURY
          </span>
        </div>

        {/* Bold Typography Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-start justify-center p-margin-edge max-w-2xl mx-auto">
          <div className="space-y-4">
            <span className="font-label-bold text-label-bold text-primary tracking-[0.3em] uppercase block">
              Established 2026
            </span>
            <h2 className="font-display-xl text-[64px] md:text-[80px] leading-[0.95] text-on-surface font-black uppercase">
              The Future <br />
              <span class="text-primary">of Commerce</span>
            </h2>
            <div className="w-24 h-2 bg-primary rounded-full mt-8 mb-12"></div>
            <p className="font-headline-md text-headline-md text-on-surface-variant max-w-md">
              TRUSTKART PREMIUM
            </p>
            <p className="font-body-lg text-body-lg text-secondary max-w-md mt-4 leading-relaxed">
              Experience the intersection of{" "}
              <span className="text-on-surface font-semibold">
                Curated Luxury
              </span>{" "}
              and{" "}
              <span className="text-on-surface font-semibold">
                Precision Tech
              </span>
              . Our seasonal collections are crafted for those who demand
              excellence in every detail.
            </p>
          </div>
        </div>

        {/* Corner Decorative Element */}
        <div className="absolute bottom-0 right-0 p-12">
          <div className="w-16 h-16 border-r-4 border-b-4 border-primary opacity-20"></div>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-margin-edge relative min-h-screen">
        {/* Mobile Brand Logo */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 md:hidden">
          <span className="font-display-xl text-headline-md tracking-tight text-primary">
            Trustkart
          </span>
        </div>

        <SignupForm />
      </section>
    </main>
  );
}

export default SignupPage;
