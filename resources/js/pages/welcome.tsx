import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen items-center justify-center bg-[#FDFDFC] p-4 dark:bg-[#0a0a0a]">
                <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-lg overflow-hidden">
                    {/* Cover Photo */}
                    <img
                        src="/images/building.jpg"
                        alt="Background"
                        className="w-full h-40 object-cover sm:h-48 md:h-56"
                    />

                    {/* Logo Overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <img
                            src="/images/default-logo.png"
                            alt="Logo"
                            className="w-24 h-24 object-contain rounded-full border-4 border-white shadow-md bg-white"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="mt-24 px-6 pb-6 text-center space-y-3 sm:mt-28 md:mt-32">
                        {auth.user ? (
                            auth.user.role === 'admin' ? (
                                <Button
                                    onClick={() => router.visit(route('billing.sy-list'))}
                                    className="w-full"
                                    variant="outline"
                                >
                                    {auth.user.name}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        if (auth.user.role === 'billing') {
                                            router.visit(route('billing.dashboard'));
                                        } else if (auth.user.role === 'admin') {
                                            router.visit(route('admin.school-year.index'));
                                        } else {
                                            window.history.back(); // fallback
                                        }
                                    }}
                                    className="w-full"
                                    variant="outline"
                                >
                                    {auth.user.name}
                                </Button>
                            )
                        ) : (
                            <>
                                <Link href={route('login')}>
                                    <Button variant="btapink" size="lg" className="w-full">Login</Button>
                                </Link>
                                {/* <Link href={route('register')}>
                                    <Button className="w-full" variant="outline">
                                        Register
                                    </Button>
                                </Link> */}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
