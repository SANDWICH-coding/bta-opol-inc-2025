import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BillingItem, Discount, Payment } from '@/types'; // Adjust imports accordingly

interface Props {
    billingItems: BillingItem[];
    discounts: Discount[];
    payments: Payment[];
}

export default function BillingTable({ billingItems, discounts, payments }: Props) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Balance</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {billingItems.map((item) => {
                    const quantity = item.pivot.quantity;
                    const amount = parseFloat(item.amount);
                    const baseSubtotal = amount * quantity;

                    const matchingDiscounts = discounts.filter((d) => d.category?.name === item.category?.name);
                    let totalDiscount = 0;
                    let discountDisplay = '—';

                    if (matchingDiscounts.length > 0) {
                        discountDisplay = matchingDiscounts.map((d) => {
                            let discount = d.value === 'fixed'
                                ? parseFloat(d.amount)
                                : (baseSubtotal * parseFloat(d.amount)) / 100;
                            totalDiscount += discount;
                            return d.value === 'percentage' ? `${d.amount}%` : `₱${parseFloat(d.amount).toFixed(2)}`;
                        }).join(', ');
                    }

                    const finalSubtotal = baseSubtotal - totalDiscount;
                    const totalPaid = payments
                        .filter((p) => p.billing?.description === item.description)
                        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
                    const balance = finalSubtotal - totalPaid;

                    return (
                        <TableRow key={item.id}>
                            <TableCell>{item.category?.name ?? '—'}</TableCell>
                            <TableCell>₱{amount.toFixed(2)}</TableCell>
                            <TableCell>x {quantity}</TableCell>
                            <TableCell>{discountDisplay}</TableCell>
                            <TableCell>₱{finalSubtotal.toFixed(2)}</TableCell>
                            <TableCell>₱{Math.max(balance, 0).toFixed(2)}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
