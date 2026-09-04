import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  ArrowRight,
  Eye,
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';

export default function Welcome() {
  const { auth } = usePage<SharedData>().props;

  return (
    <>
      <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition group-hover:scale-105">
                <img
                  src="/images/default-logo.png"
                  alt="BTA Opol Logo"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="text-base font-semibold tracking-tight text-slate-900">
                  BTA of Opol, Inc.
                </div>
                <div className="text-xs font-medium text-sky-600">
                  Blessed Trinity Academy
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {[
                { name: 'About', href: '#about' },
                { name: 'Academics', href: '#programs' },
                { name: 'Admissions', href: '#enroll' },
                { name: 'Campus Life', href: '#life' },
                { name: 'News', href: '#news' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition">
                <Search className="h-4 w-4" />
              </button>

              {auth.user ? (
                auth.user.role === 'admin' ? (
                  <Button
                    onClick={() => router.visit(route('billing.sy-list'))}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
                    variant="default"
                  >
                    {auth.user.name}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (auth.user.role === 'billing') {
                        router.visit(route('billing.dashboard'));
                      } else if (auth.user.role === 'admin') {
                        router.visit(route('admin.school-year.index'));
                      } else if (auth.user.role === 'registrar') {
                        router.visit(route('registrar.enrollment.school-year-list'));
                      } else if (auth.user.role === 'parent') {
                        router.visit(route('parent.dashboard'));
                      } else if (auth.user.role === 'user') {
                        router.visit(route('user.dashboard'));
                      } else {
                        window.history.back();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
                    variant="default"
                  >
                    {auth.user.name}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )
              ) : (
                <Link href={route('login')}>
                  <Button
                    variant="default"
                    size="lg"
                    className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
                  >
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              <button className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/hero-campus-poster.jpg"
              aria-hidden="true"
            >
              <source src="/videos/1hero-campus.mp4" type="video/mp4" />
            </video>

            {/* Soft optimistic overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/70 via-sky-800/65 to-indigo-900/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-36">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm border border-white/20">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Enrollment open for 2026–2027
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Nurturing Hearts,{' '}
                <span className="text-sky-200">
                  Minds and Faith
                </span>
              </h1>

              <p className="mt-6 text-lg text-sky-50/95 max-w-xl leading-relaxed">
                Blessed Trinity Academy of Opol is a Catholic school in Malanang,
                Opol, Misamis Oriental — committed to academic excellence,
                Christian values, and the holistic formation of every child.
              </p>

              <div className="mt-10 flex flex-wrap gap-3.5">
                <a
                  href="#enroll"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-sky-800 shadow-md hover:bg-sky-50 transition"
                >
                  Start Enrollment
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#programs"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition"
                >
                  Explore Programs
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About / Vision & Mission */}
        <section id="about" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
                  Who we are
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Vision & Mission
                </h2>

                <div className="mt-8 space-y-5">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 text-sky-600">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                        <Eye className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide">
                        Vision
                      </h3>
                    </div>
                    <p className="mt-3.5 text-[15px] leading-relaxed text-slate-600">
                      To form Christ-centered learners in Malanang and the
                      greater Opol community who reflect, collaborate, and
                      develop their talents as they strive to serve God, their
                      families, and Northern Mindanao with integrity and joy.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2.5 text-rose-500">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
                        <Heart className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide">
                        Mission
                      </h3>
                    </div>
                    <p className="mt-3.5 text-[15px] leading-relaxed text-slate-600">
                      Blessed Trinity Academy of Opol is dedicated to providing
                      a nurturing Catholic education that challenges each child
                      to reach their full potential. We model and teach
                      Christian morals and values while preparing students to
                      become compassionate leaders in church and community.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200/60">
                  <img
                    src="/images/building.jpg"
                    alt="BTA Opol Academy Campus"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 -left-5 rounded-xl bg-white p-4 shadow-md ring-1 ring-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        DepEd Recognition
                      </div>
                      <div className="text-xs text-slate-500">
                        Pre-School No. 53 · Elementary No. 438
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-20 sm:pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-sky-600 px-8 py-12 sm:px-12 sm:py-14 text-center shadow-sm">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Discover unlimited opportunities
              </h2>
              <p className="mt-3 text-sky-100 max-w-lg mx-auto text-[15px]">
                What are you waiting for? Your child’s future starts here at BTA
                of Opol, Inc.
              </p>
              <Link
                href={route('login')}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-sky-700 shadow-sm hover:bg-sky-50 transition"
              >
                Enroll Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
                    <img
                      src="/images/default-logo.png"
                      alt="BTA of Opol, Inc."
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      BTA of Opol, Inc.
                    </div>
                    <div className="text-xs text-slate-500">
                      Inspiring Excellence Daily
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-xs">
                  Dedicated to becoming the premier school community where every
                  learner thrives.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Quick Links
                </h4>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  <li>
                    <a href="#about" className="hover:text-sky-600 transition">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#programs" className="hover:text-sky-600 transition">
                      Academics
                    </a>
                  </li>
                  <li>
                    <a href="#enroll" className="hover:text-sky-600 transition">
                      Admissions
                    </a>
                  </li>
                  <li>
                    <a href="#life" className="hover:text-sky-600 transition">
                      Athletics
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 mt-0.5 text-sky-500 flex-shrink-0" />
                    <span>
                      Malanang, Opol
                      <br />
                      Misamis Oriental, Philippines
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-sky-500" />
                    0997 511 1026
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <p>© 2026 BTA of Opol, Inc. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-sky-600 transition">
                  Privacy
                </a>
                <a href="#" className="hover:text-sky-600 transition">
                  Accessibility
                </a>
                <a href="#" className="hover:text-sky-600 transition">
                  Non-Discrimination
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}