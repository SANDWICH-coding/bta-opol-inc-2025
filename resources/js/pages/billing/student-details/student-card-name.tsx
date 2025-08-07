import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface StudentCardProps {
    student: {
        profilePhoto?: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        lrn?: string;
    };
    yearLevel: {
        yearLevelName: string;
    };
    toProperCase: (str: string) => string;
}

export function StudentCard({ student, yearLevel, toProperCase }: StudentCardProps) {
    return (
        <Card className="bg-blue-100 dark:bg-blue-900 shadow-none">
            <CardContent className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage
                        src={student.profilePhoto}
                        alt={`${student.firstName} ${student.lastName}`}
                    />
                    <AvatarFallback>
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-wide">
                        {toProperCase(student.firstName)}{" "}
                        {student.middleName ? `${student.middleName.charAt(0)}.` : ""}{" "}
                        {toProperCase(student.lastName)}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-2">
                            {student.lrn && (
                                <p className="text-muted-foreground text-sm">{student.lrn}</p>
                            )}
                            <Badge variant="secondary">
                                {toProperCase(yearLevel.yearLevelName)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
