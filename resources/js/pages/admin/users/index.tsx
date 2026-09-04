import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronDown,
    Clock3,
    KeyRound,
    Mail,
    ShieldCheck,
    Sparkles,
    UserRound,
    UsersIcon,
    X,
} from 'lucide-react';
import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { Toaster, toast } from 'sonner';

interface SchoolYear {
    id: number;
    name: string;
}

interface YearLevel {
    id: number;
    school_year_id: number;
    yearLevelName: string;
    school_year?: SchoolYear;
}

interface ClassArm {
    id: number;
    year_level_id: number;
    classArmName: string;
    year_level?: YearLevel;
}

interface Enrollment {
    id: number;
    type: string;
    class_arm_id: number;
    student_id: number;
    created_at: string;
    updated_at: string;
    class_arm?: ClassArm;
}

interface Student {
    id: number;
    lrn: string;
    lastName: string;
    firstName: string;
    middleName: string | null;
    suffix: string | null;
    enrollments?: Enrollment[];
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: string | null;
    created_at: string;
    updated_at: string;
    students?: Student[];
}

interface Props {
    users: User[];
    students: Student[];
}

type ModalType =
    | 'name'
    | 'email'
    | 'role'
    | 'password'
    | 'students'
    | null;

type UserAction =
    | 'name'
    | 'email'
    | 'role'
    | 'password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
];

const roleOptions = [
    {
        value: 'user',
        label: 'User',
        description: 'Standard system user',
    },
    {
        value: 'parent',
        label: 'Parent',
        description: 'Parent account with child management access',
    },
];

export default function UsersIndex({
    users: initialUsers,
    students,
}: Props) {
    const [users, setUsers] = useState<User[]>(initialUsers);

    const [selectedUser, setSelectedUser] =
        useState<User | null>(null);

    const [modal, setModal] =
        useState<ModalType>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] =
        useState('');

    const [processing, setProcessing] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Sync Inertia users
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    /*
    |--------------------------------------------------------------------------
    | Modal helpers
    |--------------------------------------------------------------------------
    */

    const openModal = (
        user: User,
        type: Exclude<ModalType, null>,
    ) => {
        setSelectedUser(user);
        setModal(type);

        if (type === 'name') {
            setName(user.name);
        }

        if (type === 'email') {
            setEmail(user.email);
        }

        if (type === 'role') {
            setRole(user.role?.toLowerCase() ?? 'user');
        }

        if (type === 'password') {
            setPassword('');
            setPasswordConfirmation('');
        }
    };

    const closeModal = () => {
        if (processing) {
            return;
        }

        setModal(null);
        setSelectedUser(null);
        setName('');
        setEmail('');
        setRole('user');
        setPassword('');
        setPasswordConfirmation('');
    };

    /*
    |--------------------------------------------------------------------------
    | Open parent student modal
    |--------------------------------------------------------------------------
    */

    const openStudentModal = (user: User) => {
        if (user.role?.toLowerCase() !== 'parent') {
            return;
        }

        setSelectedUser(user);
        setModal('students');
    };

    /*
    |--------------------------------------------------------------------------
    | Update local user
    |--------------------------------------------------------------------------
    */

    const updateLocalUser = (
        userId: number,
        changes: Partial<User>,
    ) => {
        setUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === userId
                    ? {
                        ...user,
                        ...changes,
                    }
                    : user,
            ),
        );

        setSelectedUser((currentUser) =>
            currentUser?.id === userId
                ? {
                    ...currentUser,
                    ...changes,
                }
                : currentUser,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Update Name
    |--------------------------------------------------------------------------
    */

    const submitName = () => {
        if (!selectedUser || !name.trim()) {
            return;
        }

        const userId = selectedUser.id;
        const previousName = selectedUser.name;
        const newName = name.trim();

        updateLocalUser(userId, {
            name: newName,
        });

        setProcessing(true);

        router.patch(
            `/admin/users/${userId}/name`,
            {
                name: newName,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        'Name updated successfully',
                    );

                    closeModal();
                },

                onError: (errors) => {
                    updateLocalUser(userId, {
                        name: previousName,
                    });

                    toast.error(
                        'Failed to update name',
                        {
                            description:
                                Object.values(errors)[0] ||
                                'Something went wrong.',
                        },
                    );
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Update Email
    |--------------------------------------------------------------------------
    */

    const submitEmail = () => {
        if (!selectedUser || !email.trim()) {
            return;
        }

        const userId = selectedUser.id;
        const previousEmail = selectedUser.email;
        const newEmail = email.trim();

        updateLocalUser(userId, {
            email: newEmail,
        });

        setProcessing(true);

        router.patch(
            `/admin/users/${userId}/email`,
            {
                email: newEmail,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        'Email updated successfully',
                    );

                    closeModal();
                },

                onError: (errors) => {
                    updateLocalUser(userId, {
                        email: previousEmail,
                    });

                    toast.error(
                        'Failed to update email',
                        {
                            description:
                                Object.values(errors)[0] ||
                                'Something went wrong.',
                        },
                    );
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Update Role
    |--------------------------------------------------------------------------
    */

    const submitRole = () => {
        if (!selectedUser || !role) {
            return;
        }

        const userId = selectedUser.id;
        const previousRole = selectedUser.role;
        const newRole = role;

        updateLocalUser(userId, {
            role: newRole,
        });

        setProcessing(true);

        router.patch(
            `/admin/users/${userId}/role`,
            {
                role: newRole,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        'Role updated successfully',
                        {
                            description: `${selectedUser.name} is now ${getRoleLabel(newRole)}.`,
                        },
                    );

                    closeModal();
                },

                onError: (errors) => {
                    updateLocalUser(userId, {
                        role: previousRole,
                    });

                    toast.error(
                        'Failed to update role',
                        {
                            description:
                                Object.values(errors)[0] ||
                                'Something went wrong. Please try again.',
                        },
                    );
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Reset Password
    |--------------------------------------------------------------------------
    */

    const submitPassword = () => {
        if (
            !selectedUser ||
            password.length < 8 ||
            password !== passwordConfirmation
        ) {
            return;
        }

        setProcessing(true);

        router.patch(
            `/admin/users/${selectedUser.id}/password`,
            {
                password,
                password_confirmation:
                    passwordConfirmation,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        'Password reset successfully',
                        {
                            description: `A new password has been set for ${selectedUser.name}.`,
                        },
                    );

                    closeModal();
                },

                onError: (errors) => {
                    toast.error(
                        'Failed to reset password',
                        {
                            description:
                                Object.values(errors)[0] ||
                                'Something went wrong.',
                        },
                    );
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const pendingUsers = users.filter(
        (user) =>
            user.role?.toLowerCase() === 'user',
    ).length;

    const verifiedUsers =
        users.length - pendingUsers;

    const getInitials = (userName: string) => {
        return (
            userName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) =>
                    part.charAt(0).toUpperCase(),
                )
                .join('') || '?'
        );
    };

    const getRoleLabel = (
        userRole: string | null,
    ) => {
        if (!userRole) {
            return 'User';
        }

        return (
            userRole.charAt(0).toUpperCase() +
            userRole.slice(1).toLowerCase()
        );
    };

    const isPending = (user: User) => {
        return (
            user.role?.toLowerCase() === 'user'
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Update students after add/remove
    |--------------------------------------------------------------------------
    */

    const updateUserStudents = (
        userId: number,
        updatedStudents: Student[],
    ) => {
        updateLocalUser(userId, {
            students: updatedStudents,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <Toaster
                position="top-right"
                richColors
                closeButton
            />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 sm:p-8 lg:p-10">

                {/* HERO HEADER */}

                <div className="relative mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 shadow-xl shadow-blue-900/10 sm:p-8 dark:border-blue-900/40">

                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

                    <div className="pointer-events-none absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-white/5" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div className="max-w-2xl">

                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
                                <Sparkles className="h-3.5 w-3.5" />
                                User Management
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Manage your users with confidence.
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                                Keep your accounts organized,
                                secure, and up to date.
                                Manage user information,
                                roles, students, and access
                                from one place.
                            </p>

                        </div>

                        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                                <UsersIcon className="h-6 w-6 text-white" />
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
                                    Total Users
                                </p>

                                <p className="mt-0.5 text-3xl font-bold text-white">
                                    {users.length}
                                </p>
                            </div>

                        </div>

                    </div>
                </div>

                {/* STATISTICS */}

                <div className="mb-8 grid gap-4 sm:grid-cols-3">

                    {/* Total */}

                    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>

                            <span className="text-xs font-medium text-slate-400">
                                All accounts
                            </span>

                        </div>

                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {users.length}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Total registered users
                        </p>

                    </div>

                    {/* Pending */}

                    <div className="group rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900/40 dark:from-amber-950/30 dark:to-slate-900">

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                                <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>

                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Needs review
                            </span>

                        </div>

                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {pendingUsers}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Pending verification
                        </p>

                    </div>

                    {/* Verified */}

                    <div className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-slate-900">

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>

                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                Active access
                            </span>

                        </div>

                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {verifiedUsers}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Verified accounts
                        </p>

                    </div>

                </div>

                {/* DESKTOP TABLE */}

                <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">

                    <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                                    All Users
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Manage account details,
                                    permissions, and students.
                                </p>
                            </div>

                            <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 lg:flex">

                                <ShieldCheck className="h-4 w-4" />

                                Admin controls enabled

                            </div>

                        </div>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px] text-left">

                            <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">

                                <tr>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        User
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Role
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Verification
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Registered
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                                {users.map((user) => (

                                    <tr
                                        key={user.id}
                                        onClick={() => {
                                            if (
                                                user.role?.toLowerCase() ===
                                                'parent'
                                            ) {
                                                openStudentModal(user);
                                            }
                                        }}
                                        className={`group transition-colors ${user.role?.toLowerCase() ===
                                            'parent'
                                            ? 'cursor-pointer hover:bg-blue-50/60 dark:hover:bg-blue-950/30'
                                            : 'hover:bg-blue-50/40 dark:hover:bg-blue-950/20'
                                            }`}
                                    >

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                                                    {getInitials(
                                                        user.name,
                                                    )}
                                                </div>

                                                <div className="min-w-0">

                                                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                                        {user.name}
                                                    </p>

                                                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">

                                                        <Mail className="h-3.5 w-3.5 shrink-0" />

                                                        <span className="truncate">
                                                            {user.email}
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-2">

                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">

                                                    <ShieldCheck className="h-3.5 w-3.5" />

                                                    {getRoleLabel(
                                                        user.role,
                                                    )}

                                                </span>

                                                {user.role?.toLowerCase() ===
                                                    'parent' && (
                                                        <span className="text-xs font-medium text-blue-500">
                                                            Manage students
                                                        </span>
                                                    )}

                                            </div>

                                        </td>

                                        <td className="px-6 py-5">

                                            {isPending(user) ? (

                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">

                                                    <Clock3 className="h-3.5 w-3.5" />

                                                    Pending

                                                </span>

                                            ) : (

                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">

                                                    <CheckCircle2 className="h-3.5 w-3.5" />

                                                    Verified

                                                </span>

                                            )}

                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">

                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString(
                                                undefined,
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                },
                                            )}

                                        </td>

                                        <td
                                            className="px-6 py-5 text-right"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >

                                            <UserActions
                                                user={user}
                                                onAction={openModal}
                                            />

                                        </td>

                                    </tr>

                                ))}

                                {users.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan={5}
                                            className="px-6 py-16 text-center"
                                        >
                                            <EmptyState />
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* MOBILE CARDS */}

                <div className="space-y-4 md:hidden">

                    {users.length > 0 ? (

                        users.map((user) => (

                            <div
                                key={user.id}
                                onClick={() => {
                                    if (
                                        user.role?.toLowerCase() ===
                                        'parent'
                                    ) {
                                        openStudentModal(user);
                                    }
                                }}
                                className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${user.role?.toLowerCase() ===
                                    'parent'
                                    ? 'cursor-pointer'
                                    : ''
                                    }`}
                            >

                                <div className="p-4">

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                                            {getInitials(
                                                user.name,
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="min-w-0">

                                                    <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                                        {user.name}
                                                    </h3>

                                                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                                                        {user.email}
                                                    </p>

                                                </div>

                                                <div
                                                    onClick={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <UserActions
                                                        user={user}
                                                        onAction={openModal}
                                                        compact
                                                    />
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">

                                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">

                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Role
                                            </p>

                                            <p className="mt-1 text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">
                                                {getRoleLabel(
                                                    user.role,
                                                )}
                                            </p>

                                        </div>

                                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">

                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Status
                                            </p>

                                            <div className="mt-1">

                                                {isPending(user) ? (

                                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">

                                                        <Clock3 className="h-3.5 w-3.5" />

                                                        Pending

                                                    </span>

                                                ) : (

                                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">

                                                        <CheckCircle2 className="h-3.5 w-3.5" />

                                                        Verified

                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                    {user.role?.toLowerCase() ===
                                        'parent' && (
                                            <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                                                {user.students?.length ?? 0}{' '}
                                                connected student
                                                {(user.students?.length ?? 0) !==
                                                    1
                                                    ? 's'
                                                    : ''}
                                                {' • '}
                                                Tap to manage
                                            </div>
                                        )}

                                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">

                                        <span className="text-xs text-slate-400">
                                            Registered
                                        </span>

                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">

                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString(
                                                undefined,
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                },
                                            )}

                                        </span>

                                    </div>

                                </div>

                            </div>

                        ))

                    ) : (

                        <EmptyState />

                    )}

                </div>

            </div>

            {/* NAME MODAL */}

            {modal === 'name' &&
                selectedUser && (
                    <Modal
                        title="Update User Name"
                        description={`Change the display name for ${selectedUser.email}.`}
                        icon={
                            <UserRound className="h-5 w-5" />
                        }
                        iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                        onClose={closeModal}
                    >

                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Full name
                        </label>

                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value,
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    'Enter'
                                ) {
                                    submitName();
                                }
                            }}
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            placeholder="Enter full name"
                        />

                        <ModalButtons
                            onCancel={closeModal}
                            onSubmit={submitName}
                            submitText="Save Name"
                            processing={processing}
                            disabled={!name.trim()}
                        />

                    </Modal>
                )}

            {/* EMAIL MODAL */}

            {modal === 'email' &&
                selectedUser && (
                    <Modal
                        title="Update Email Address"
                        description="Make sure the new email address is correct and accessible."
                        icon={
                            <Mail className="h-5 w-5" />
                        }
                        iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                        onClose={closeModal}
                    >

                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email address
                        </label>

                        <input
                            autoFocus
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value,
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    'Enter'
                                ) {
                                    submitEmail();
                                }
                            }}
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            placeholder="name@example.com"
                        />

                        <ModalButtons
                            onCancel={closeModal}
                            onSubmit={submitEmail}
                            submitText="Save Email"
                            processing={processing}
                            disabled={!email.trim()}
                        />

                    </Modal>
                )}

            {/* ROLE MODAL */}

            {modal === 'role' &&
                selectedUser && (
                    <Modal
                        title="Change User Role"
                        description={`Choose the access level for ${selectedUser.name}.`}
                        icon={
                            <ShieldCheck className="h-5 w-5" />
                        }
                        iconClass="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                        onClose={closeModal}
                    >

                        <div className="space-y-2">

                            {roleOptions.map(
                                (option) => {
                                    const selected =
                                        role ===
                                        option.value;

                                    return (
                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            onClick={() =>
                                                setRole(
                                                    option.value,
                                                )
                                            }
                                            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${selected
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-blue-950/30'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                                                }`}
                                        >

                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${selected
                                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}
                                            >
                                                <ShieldCheck className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {
                                                        option.label
                                                    }
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                    {
                                                        option.description
                                                    }
                                                </p>

                                            </div>

                                            {selected && (
                                                <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                                            )}

                                        </button>
                                    );
                                },
                            )}

                        </div>

                        <ModalButtons
                            onCancel={closeModal}
                            onSubmit={submitRole}
                            submitText="Update Role"
                            processing={processing}
                            disabled={!role}
                        />

                    </Modal>
                )}

            {/* PASSWORD MODAL */}

            {modal === 'password' &&
                selectedUser && (
                    <Modal
                        title="Reset User Password"
                        description={`Create a new secure password for ${selectedUser.name}.`}
                        icon={
                            <KeyRound className="h-5 w-5" />
                        }
                        iconClass="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                        onClose={closeModal}
                    >

                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">

                            <p className="text-sm leading-5 text-rose-700 dark:text-rose-300">
                                The user's existing
                                password will be
                                replaced. Make sure
                                the new password is
                                kept secure.
                            </p>

                        </div>

                        <div className="mt-5">

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                New password
                            </label>

                            <input
                                autoFocus
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target
                                            .value,
                                    )
                                }
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                placeholder="At least 8 characters"
                            />

                        </div>

                        <div className="mt-4">

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Confirm password
                            </label>

                            <input
                                type="password"
                                value={
                                    passwordConfirmation
                                }
                                onChange={(event) =>
                                    setPasswordConfirmation(
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                placeholder="Re-enter new password"
                            />

                            {passwordConfirmation &&
                                password !==
                                passwordConfirmation && (
                                    <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                                        Passwords
                                        do not
                                        match.
                                    </p>
                                )}

                        </div>

                        <ModalButtons
                            onCancel={closeModal}
                            onSubmit={submitPassword}
                            submitText="Reset Password"
                            processing={processing}
                            danger
                            disabled={
                                password.length <
                                8 ||
                                password !==
                                passwordConfirmation
                            }
                        />

                    </Modal>
                )}

            {/* PARENT STUDENTS MODAL */}

            {modal === 'students' &&
                selectedUser && (
                    <ParentStudentsModal
                        parent={selectedUser}
                        students={students}
                        onClose={closeModal}
                        onUpdated={(updatedStudents) =>
                            updateUserStudents(
                                selectedUser.id,
                                updatedStudents,
                            )
                        }
                    />
                )}

        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| User Actions
|--------------------------------------------------------------------------
*/

interface UserActionsProps {
    user: User;
    onAction: (
        user: User,
        action: UserAction,
    ) => void;
    compact?: boolean;
}

function UserActions({
    user,
    onAction,
    compact = false,
}: UserActionsProps) {
    const [open, setOpen] =
        useState(false);

    const buttonRef =
        useRef<HTMLButtonElement | null>(null);

    const menuRef =
        useRef<HTMLDivElement | null>(null);

    const [position, setPosition] =
        useState({
            top: 0,
            right: 0,
        });

    const updatePosition = () => {
        if (!buttonRef.current) {
            return;
        }

        const rect =
            buttonRef.current.getBoundingClientRect();

        const menuHeight = 280;
        const menuWidth = 224;
        const spacing = 8;

        const spaceBelow =
            window.innerHeight - rect.bottom;

        const openUp =
            spaceBelow < menuHeight &&
            rect.top > menuHeight;

        const top = openUp
            ? rect.top -
            menuHeight -
            spacing
            : rect.bottom + spacing;

        let right =
            window.innerWidth -
            rect.right;

        right = Math.max(
            8,
            Math.min(
                right,
                window.innerWidth -
                menuWidth -
                8,
            ),
        );

        setPosition({
            top,
            right,
        });
    };

    const toggleMenu = () => {
        if (!open) {
            updatePosition();
        }

        setOpen(
            (current) => !current,
        );
    };

    const handleAction = (
        action: UserAction,
    ) => {
        setOpen(false);
        onAction(user, action);
    };

    useEffect(() => {
        if (!open) {
            return;
        }

        const handlePointerDown = (
            event: MouseEvent,
        ) => {
            const target =
                event.target as Node;

            if (
                buttonRef.current?.contains(
                    target,
                ) ||
                menuRef.current?.contains(
                    target,
                )
            ) {
                return;
            }

            setOpen(false);
        };

        const handleScroll = () => {
            setOpen(false);
        };

        const handleResize = () => {
            updatePosition();
        };

        document.addEventListener(
            'mousedown',
            handlePointerDown,
        );

        window.addEventListener(
            'scroll',
            handleScroll,
            true,
        );

        window.addEventListener(
            'resize',
            handleResize,
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handlePointerDown,
            );

            window.removeEventListener(
                'scroll',
                handleScroll,
                true,
            );

            window.removeEventListener(
                'resize',
                handleResize,
            );
        };
    }, [open]);

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={toggleMenu}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 ${compact
                    ? 'h-9 w-9 p-0'
                    : 'px-3 py-2'
                    }`}
            >
                {compact ? (
                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${open
                            ? 'rotate-180'
                            : ''
                            }`}
                    />
                ) : (
                    <>
                        Manage

                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${open
                                ? 'rotate-180'
                                : ''
                                }`}
                        />
                    </>
                )}
            </button>

            {open && (
                <div
                    ref={menuRef}
                    role="menu"
                    className="fixed z-[100] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-2xl shadow-slate-950/15 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
                    style={{
                        top: position.top,
                        right: position.right,
                    }}
                >
                    <div className="px-3 py-2">

                        <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Manage account
                        </p>

                        <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">
                            {user.name}
                        </p>

                    </div>

                    <ActionButton
                        icon={
                            <UserRound className="h-4 w-4" />
                        }
                        label="Change Name"
                        description="Update display name"
                        onClick={() =>
                            handleAction(
                                'name',
                            )
                        }
                    />

                    <ActionButton
                        icon={
                            <Mail className="h-4 w-4" />
                        }
                        label="Change Email"
                        description="Update email address"
                        onClick={() =>
                            handleAction(
                                'email',
                            )
                        }
                    />

                    <ActionButton
                        icon={
                            <ShieldCheck className="h-4 w-4" />
                        }
                        label="Change Role"
                        description="Manage access level"
                        onClick={() =>
                            handleAction(
                                'role',
                            )
                        }
                    />

                    <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                    <ActionButton
                        icon={
                            <KeyRound className="h-4 w-4" />
                        }
                        label="Reset Password"
                        description="Set a new password"
                        danger
                        onClick={() =>
                            handleAction(
                                'password',
                            )
                        }
                    />
                </div>
            )}
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Action Button
|--------------------------------------------------------------------------
*/

interface ActionButtonProps {
    icon: ReactNode;
    label: string;
    description: string;
    onClick: () => void;
    danger?: boolean;
}

function ActionButton({
    icon,
    label,
    description,
    onClick,
    danger = false,
}: ActionButtonProps) {
    return (
        <button
            type="button"
            role="menuitem"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${danger
                ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30'
                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
        >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${danger
                    ? 'bg-rose-100 dark:bg-rose-900/30'
                    : 'bg-slate-100 dark:bg-slate-800'
                    }`}
            >
                {icon}
            </div>

            <div className="min-w-0">

                <p className="text-sm font-semibold">
                    {label}
                </p>

                <p
                    className={`mt-0.5 text-[11px] ${danger
                        ? 'text-rose-500/80 dark:text-rose-400/70'
                        : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    {description}
                </p>

            </div>
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| Generic Modal
|--------------------------------------------------------------------------
*/

interface ModalProps {
    title: string;
    description: string;
    icon: ReactNode;
    iconClass: string;
    onClose: () => void;
    children: ReactNode;
}

function Modal({
    title,
    description,
    icon,
    iconClass,
    onClose,
    children,
}: ModalProps) {
    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">

                    <div className="flex min-w-0 items-start gap-3">

                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                        >
                            {icon}
                        </div>

                        <div className="min-w-0">

                            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                                {title}
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                {description}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>

                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-6 py-6">
                    {children}
                </div>

            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Parent Students Modal
|--------------------------------------------------------------------------
*/

interface ParentStudentsModalProps {
    parent: User;
    students: Student[];
    onClose: () => void;
    onUpdated: (students: Student[]) => void;
}

function ParentStudentsModal({
    parent,
    students,
    onClose,
    onUpdated,
}: ParentStudentsModalProps) {
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState<number | null>(null);

    const assignedStudents = parent.students ?? [];

    const assignedIds = new Set(
        assignedStudents.map((student) => student.id),
    );

    const searchTerm = search.trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Already assigned students
    |--------------------------------------------------------------------------
    */

    const filteredAssignedStudents = assignedStudents.filter((student) => {
        const fullName = [
            student.firstName,
            student.middleName,
            student.lastName,
            student.suffix,
        ]
            .filter(Boolean)
            .join(' ');

        const searchText =
            `${fullName} ${student.lrn}`.toLowerCase();

        return searchText.includes(searchTerm);
    });

    /*
    |--------------------------------------------------------------------------
    | Available students
    |--------------------------------------------------------------------------
    |
    | Exclude students that are already connected to this parent.
    |
    */

    const availableStudents = students.filter((student) => {
        if (assignedIds.has(student.id)) {
            return false;
        }

        const fullName = [
            student.firstName,
            student.middleName,
            student.lastName,
            student.suffix,
        ]
            .filter(Boolean)
            .join(' ');

        const searchText =
            `${fullName} ${student.lrn}`.toLowerCase();

        return searchText.includes(searchTerm);
    });

    /*
    |--------------------------------------------------------------------------
    | Add Student
    |--------------------------------------------------------------------------
    */

    const addStudent = (student: Student) => {
        setProcessing(student.id);

        router.post(
            `/admin/users/${parent.id}/students`,
            {
                student_id: student.id,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    onUpdated([
                        ...assignedStudents,
                        student,
                    ]);

                    toast.success('Student added', {
                        description: `${getStudentName(student)} is now linked to ${parent.name}.`,
                    });
                },

                onError: (errors) => {
                    toast.error('Failed to add student', {
                        description:
                            Object.values(errors)[0] ||
                            'Something went wrong.',
                    });
                },

                onFinish: () => {
                    setProcessing(null);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Remove Student
    |--------------------------------------------------------------------------
    */

    const removeStudent = (student: Student) => {
        setProcessing(student.id);

        router.delete(
            `/admin/users/${parent.id}/students/${student.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    onUpdated(
                        assignedStudents.filter(
                            (item) =>
                                item.id !== student.id,
                        ),
                    );

                    toast.success('Student removed', {
                        description: `${getStudentName(student)} has been removed from ${parent.name}.`,
                    });
                },

                onError: (errors) => {
                    toast.error('Failed to remove student', {
                        description:
                            Object.values(errors)[0] ||
                            'Something went wrong.',
                    });
                },

                onFinish: () => {
                    setProcessing(null);
                },
            },
        );
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

                {/* =========================================================
                HEADER
            ========================================================== */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <UsersIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                                Manage Students
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Manage students connected to{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {parent.name}
                                </span>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* =========================================================
                SEARCH
            ========================================================== */}
                <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search student name or LRN..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                {/* =========================================================
                CONTENT
            ========================================================== */}
                <div className="max-h-[60vh] overflow-y-auto px-6 py-5">

                    {/* =====================================================
                    ALREADY CONNECTED STUDENTS
                ====================================================== */}
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                    Already Added Students
                                </h3>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    These students are currently connected
                                    to this parent.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                {assignedStudents.length}
                            </span>
                        </div>

                        {filteredAssignedStudents.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAssignedStudents.map((student) => {
                                    const busy =
                                        processing === student.id;

                                    return (
                                        <div
                                            key={student.id}
                                            className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/20"
                                        >
                                            {/* =================================================
                                            STUDENT INFORMATION
                                        ================================================== */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {getStudentName(student)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        LRN: {student.lrn}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        removeStudent(student)
                                                    }
                                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                                >
                                                    {busy ? (
                                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-300 border-t-rose-600" />
                                                    ) : (
                                                        <X className="h-3.5 w-3.5" />
                                                    )}

                                                    Remove
                                                </button>
                                            </div>

                                            {/* =================================================
                                            ENROLLMENT DETAILS
                                        ================================================== */}
                                            <div className="mt-4 border-t border-blue-200/70 pt-4 dark:border-blue-900/40">

                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                        Enrollment Details
                                                    </p>

                                                    {student.enrollments?.length ? (
                                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            {
                                                                student.enrollments.length
                                                            }{' '}
                                                            enrollment
                                                            {student.enrollments.length !==
                                                                1
                                                                ? 's'
                                                                : ''}
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {student.enrollments &&
                                                    student.enrollments.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {student.enrollments.map(
                                                            (enrollment) => (
                                                                <div
                                                                    key={
                                                                        enrollment.id
                                                                    }
                                                                    className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/40 dark:bg-slate-900/70"
                                                                >
                                                                    {/* Enrollment type */}
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                                            Enrollment
                                                                        </span>

                                                                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                                            {
                                                                                enrollment.type
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    {/* Year Level + Class Arm */}
                                                                    <div className="mt-3">
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                                            Class
                                                                        </p>

                                                                        <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                                                                            {enrollment.class_arm
                                                                                ?.year_level
                                                                                ?.yearLevelName ??
                                                                                'Year Level N/A'}
                                                                            {' - '}
                                                                            {enrollment.class_arm
                                                                                ?.classArmName ??
                                                                                'Class Arm N/A'}
                                                                        </p>
                                                                    </div>

                                                                    {/* School Year */}
                                                                    <div className="mt-3">
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                                            School Year
                                                                        </p>

                                                                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                            {enrollment.class_arm
                                                                                ?.year_level
                                                                                ?.school_year
                                                                                ?.name ??
                                                                                'N/A'}
                                                                        </p>
                                                                    </div>

                                                                    {/* Enrollment Date */}
                                                                    {enrollment.created_at && (
                                                                        <div className="mt-3">
                                                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                                                Enrolled
                                                                            </p>

                                                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                                {new Date(
                                                                                    enrollment.created_at,
                                                                                ).toLocaleDateString(
                                                                                    undefined,
                                                                                    {
                                                                                        year: 'numeric',
                                                                                        month: 'long',
                                                                                        day: 'numeric',
                                                                                    },
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                                                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                            No enrollment record found.
                                                        </p>

                                                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                                            This student is connected
                                                            to the parent but does
                                                            not currently have an
                                                            enrollment record.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : assignedStudents.length > 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    No connected students match your search.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                                <UsersIcon className="mx-auto h-8 w-8 text-slate-400" />

                                <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
                                    No students connected
                                </p>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Add a student below.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* =====================================================
                    AVAILABLE STUDENTS
                ====================================================== */}
                    <section className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                        <div className="mb-4">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                Add Students
                            </h3>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Students below are not currently connected
                                to this parent.
                            </p>
                        </div>

                        {availableStudents.length > 0 ? (
                            <div className="space-y-2">
                                {availableStudents.map((student) => {
                                    const busy =
                                        processing === student.id;

                                    return (
                                        <div
                                            key={student.id}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {getStudentName(student)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        LRN: {student.lrn}
                                                    </p>

                                                    {/* Show enrollment summary */}
                                                    {student.enrollments &&
                                                        student.enrollments.length > 0 ? (
                                                        <div className="mt-3 space-y-1">
                                                            {student.enrollments.map(
                                                                (enrollment) => (
                                                                    <div
                                                                        key={
                                                                            enrollment.id
                                                                        }
                                                                        className="text-xs text-slate-500 dark:text-slate-400"
                                                                    >
                                                                        <span className="font-medium text-slate-600 dark:text-slate-300">
                                                                            {
                                                                                enrollment.class_arm
                                                                                    ?.year_level
                                                                                    ?.yearLevelName
                                                                            }
                                                                        </span>

                                                                        {' - '}

                                                                        {
                                                                            enrollment.class_arm
                                                                                ?.classArmName
                                                                        }

                                                                        {' • '}

                                                                        {
                                                                            enrollment.class_arm
                                                                                ?.year_level
                                                                                ?.school_year
                                                                                ?.name
                                                                        }
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-xs text-amber-500 dark:text-amber-400">
                                                            No enrollment record
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        addStudent(student)
                                                    }
                                                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {busy ? (
                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    ) : (
                                                        <span className="text-base leading-none">
                                                            +
                                                        </span>
                                                    )}

                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {search
                                        ? 'No available students match your search.'
                                        : 'All students are already connected to this parent.'}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* =========================================================
                FOOTER
            ========================================================== */}
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {assignedStudents.length}
                        </span>{' '}
                        student
                        {assignedStudents.length !== 1 ? 's' : ''}{' '}
                        assigned
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

}


/*
|--------------------------------------------------------------------------
| Modal Buttons
|--------------------------------------------------------------------------
*/

interface ModalButtonsProps {
    onCancel: () => void;
    onSubmit: () => void;
    submitText: string;
    processing: boolean;
    disabled?: boolean;
    danger?: boolean;
}

function ModalButtons({
    onCancel,
    onSubmit,
    submitText,
    processing,
    disabled = false,
    danger = false,
}: ModalButtonsProps) {
    return (
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

            <button
                type="button"
                onClick={onCancel}
                disabled={processing}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
                Cancel
            </button>

            <button
                type="button"
                onClick={onSubmit}
                disabled={
                    disabled ||
                    processing
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${danger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >

                {processing && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {processing
                    ? 'Saving...'
                    : submitText}

            </button>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">

                <UsersIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />

            </div>

            <h3 className="mt-5 font-semibold text-slate-900 dark:text-slate-100">
                No users yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                There are currently no registered
                users in the system. New accounts
                will appear here once they register.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">

                <Sparkles className="h-3.5 w-3.5" />

                Your user list is ready

            </div>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Student Name Helper
|--------------------------------------------------------------------------
*/

function getStudentName(
    student: Student,
) {
    return [
        student.firstName,
        student.middleName,
        student.lastName,
        student.suffix,
    ]
        .filter(Boolean)
        .join(' ');
}
