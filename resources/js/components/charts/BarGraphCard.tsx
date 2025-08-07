import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type BarGraphCardProps = {
    title: string;
    data: { name: string; value: number }[];
    barColor?: string;
    unitLabel?: string;
};

export const BarGraphCard: React.FC<BarGraphCardProps> = ({
    title,
    data,
    barColor = '#3b82f6', // default Tailwind blue-500
    unitLabel = '₱',
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `${unitLabel}${val}`} />
                        <Tooltip
                            formatter={(value: number) =>
                                `${unitLabel}${new Intl.NumberFormat('en-PH').format(value)}`
                            }
                        />
                        <Bar dataKey="value" fill={barColor} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
