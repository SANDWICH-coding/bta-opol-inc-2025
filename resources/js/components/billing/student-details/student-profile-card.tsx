import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Props {
    firstName: string;
    middleName?: string;
    lastName: string;
    profilePhoto?: string;
    lrn?: string;
    yearLevelName: string;
}

export default function StudentProfileCard({ firstName, middleName, lastName, profilePhoto, lrn, yearLevelName }: Props) {
    const toProperCase = (name: string) => name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={profilePhoto} alt={`${firstName} ${lastName}`} />
                    <AvatarFallback>
                        {firstName.charAt(0)}
                        {lastName.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                    <h4 className="text-xl font-semibold tracking-wide">
                        {toProperCase(firstName)} {middleName ? `${middleName.charAt(0)}.` : ''} {toProperCase(lastName)}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        {lrn && <p className="text-sm text-muted-foreground">{lrn}</p>}
                        <Badge variant="secondary">{toProperCase(yearLevelName)}</Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}
