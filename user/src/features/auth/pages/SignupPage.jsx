import SignupForm from "../components/SignupForm";

function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-surface-container-low font-body-md overflow-x-hidden">
      {/* Brand/Photography Sidebar (Hidden on Mobile) */}
      <section className="hidden md:flex relative w-1/2 bg-surface-container-lowest overflow-hidden">
        {/* Ghost Text */}
        <div className="absolute -left-12 top-1/4 opacity-5 select-none pointer-events-none">
          <span className="font-display-bg-ghost text-display-bg-ghost text-on-surface">
            TRUSTKART
          </span>
        </div>
        <div className="absolute -right-12 bottom-1/4 opacity-5 select-none pointer-events-none">
          <span className="font-display-bg-ghost text-display-bg-ghost text-on-surface">
            PREMIUM
          </span>
        </div>

        {/* Main Imagery & Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-margin-edge">
          <div className="relative w-full max-w-lg aspect-square">
            <img
              alt="Sophisticated Designer Product"
              className="w-full h-full object-cover rounded-lg shadow-2xl scale-110 -rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdypoNJxnm--qs7gGlwdpoS4FMAoVGbgISF71MJMtl6dG8gzfcQjhKbpAhlBT7VQuEg2-0Vrkh5MB_keLw-zOqlIy_3HdoynpoSVH1RGo1YKWKIV4DNY7UiEjXRQupiI6TTl_uh3HOCsH_bzR3ogPNLNODOBRewJ7z6XasC0s2a6RD6grmQSQsAs3uwm53gycsJEn127gUAbj4gHpAoJWgg4u1ns_Yr6Yn8eUyhzeZifoBQK80G--2ObeeDwe9R0WzlmlWRDH6UFG3"
            />
            {/* Decorative Ambient blur glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary rounded-full blur-3xl opacity-10 pointer-events-none"></div>
          </div>
          <div className="mt-section-gap text-center max-w-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
              Elevate Your Everyday.
            </h2>
            <p className="font-body-lg text-body-lg text-secondary">
              Join the Trustkart community for a curated experience of premium tech, lifestyle essentials, and exclusive seasonal collections.
            </p>
          </div>
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
