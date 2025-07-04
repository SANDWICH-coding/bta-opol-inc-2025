import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/building.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/40" />

                {/* Logo + App Name */}
                <Link
                    href={route('login')}
                    className="relative z-20 mb-8 flex items-center text-lg font-semibold"
                >
                    <AppLogoIcon className="mr-2 size-8 fill-current text-white" />
                    {name}
                </Link>

                {/* Footer Contact Details */}
                <div className="relative z-20 mt-auto text-sm text-neutral-200">
                    <h3 className="mb-4 text-base font-semibold text-white">Contact Us</h3>
                    {/* Address */}
                    <div className="mb-3 flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                        </svg>
                        <a
                            href="https://www.google.com/maps?q=Pag-ibig+Citihomes,+Opol,+Misamis+Oriental"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white"
                        >
                            Pag-ibig Citihomes, Opol, Misamis Oriental
                        </a>
                    </div>

                    {/* Email */}
                    <div className="mb-3 flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 4C1.44772 4 1 4.44772 1 5V19C1 19.5523 1.44772 20 2 20H22C22.5523 20 23 19.5523 23 19V5C23 4.44772 22.5523 4 22 4H2ZM4.25 6H19.75L12 11.175L4.25 6ZM3 6.878L11.447 12.382C11.778 12.5973 12.222 12.5973 12.553 12.382L21 6.878V18H3V6.878Z" />
                        </svg>

                        <a href="mailto:blessed.opol@gmail.com" className="hover:text-white">
                            blessed.opol@gmail.com
                        </a>
                    </div>

                    {/* Phone */}
                    <div className="mb-3 flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 fill-current" viewBox="0 0 24 24">
                            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1v3.61a1 1 0 0 1-1 1A17.91 17.91 0 0 1 2 5a1 1 0 0 1 1-1h3.61a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.26 1.11l-2.3 2.3z" />
                        </svg>
                        <a href="tel:09975111026" className="hover:text-white">0997 511 1026</a>
                    </div>

                    {/* Facebook */}
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 fill-current" viewBox="0 0 24 24">
                            <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.9c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.6.7-1.6 1.5v1.8h2.8L15.5 15h-2v7A10 10 0 0 0 22 12z" />
                        </svg>
                        <a
                            href="https://web.facebook.com/btaofopol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white"
                        >
                            Blessed Trinity Academy of Opol
                        </a>
                    </div>
                </div>
            </div>


            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
