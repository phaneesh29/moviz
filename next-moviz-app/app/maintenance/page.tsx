import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maintenance | Vidoza',
  description: 'Vidoza is temporarily down for maintenance. We will be back shortly.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main className="page-shell flex items-center justify-center px-4 py-12">
      <section className="cinema-panel spotlight-ring w-full max-w-2xl rounded-3xl p-8 text-center sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-soft)]">
          Scheduled Maintenance
        </p>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
          We&apos;ll Be Back Soon
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-white/65 sm:text-lg">
          We&apos;re temporarily offline while we improve the platform. Thanks for your patience.
        </p>
      </section>
    </main>
  );
}