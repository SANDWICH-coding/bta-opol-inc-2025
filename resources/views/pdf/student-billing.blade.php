<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{ $student->firstName }} {{ $student->middleName ? $student->middleName[0] . '.' : '' }}
        {{ $student->lastName }}
    </title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10.2px;
            color: #222;
            margin: 0;
        }

        .header,
        .card {
            margin-bottom: 12px;
        }

        .school-header {
            /* border-bottom: 1px solid #999; */
            padding-bottom: 4px;
        }

        .school-name {
            font-size: 14px;
            font-weight: bold;
            color: #111;
        }

        .contact-info {
            font-size: 10px;
            color: #555;
        }

        .statement-title {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            text-align: right;
        }

        .card {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
        }

        .card2 {
            padding: 10px;
        }

        .section-title {
            font-size: 12.5px;
            font-weight: bold;
            margin-bottom: 4px;
            border-left: 3px solid #c07984ff;
            padding-left: 8px;
            color: #c07984ff;
        }

        .subtext {
            font-size: 10.2px;
            margin-bottom: 4px;
        }

        .student-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #7b454dff;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }

        th,
        td {
            padding: 4px 6px;
            border: 1px solid #ccc;
            vertical-align: top;
        }

        th {
            background-color: #f1f1f1;
            font-weight: bold;
            text-align: left;
            font-size: 10.2px;
        }

        td {
            font-size: 9.8px;
        }

        tr:nth-child(even) td {
            background-color: #f9f9f9;
        }

        .right {
            text-align: right;
        }

        .totals {
            font-weight: bold;
            margin-top: 6px;
            text-align: right;
            font-size: 10.5px;
        }

        img.logo {
            width: 60px;
            height: 60px;
        }

        ul {
            list-style-type: decimal;
            padding-left: 16px;
            margin: 6px 0;
            font-size: 10px;
        }

        li {
            margin-bottom: 4px;
        }

        .footer-note {
            font-style: italic;
            color: #444;
            text-align: center;
            margin-top: 8px;
            font-size: 10px;
        }

        .fixed-footer {
            position: fixed;
            bottom: 12px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9.5px;
            color: #555;
            border-top: 1px solid #ccc;
            padding-top: 6px;
        }
    </style>

</head>

<body>

    <!-- Header -->
    <div class="header school-header">
        <table width="100%" style="border: none; border-collapse: collapse;">
            <tr>
                <td style="border: none; width: 60px;">
                    <img src="{{ public_path('images/default-logo.png') }}" alt="Logo" class="logo">
                </td>
                <td style="border: none;">
                    <div class="school-name">BLESSED TRINITY ACADEMY</div>
                    <div class="contact-info">blessed.opol@gmail.com • (0997) 511 1026</div>
                    <div class="contact-info">Zone 2, Malanang, Opol, Misamis Oriental</div>
                </td>
                <td class="statement-title" style="border: none;">
                    STATEMENT OF ACCOUNT<br>
                    S.Y. {{ $enrollment->classArm->yearLevel->schoolYear->name }}
                </td>
            </tr>
        </table>

    </div>

    <!-- Student Info -->
    <div class="card2">
        <div class="student-name">{{ $student->firstName }} {{ $student->middleName ? $student->middleName[0] . '.' : '' }}
            {{ $student->lastName }}
        </div>
        <div class="subtext"><span style="padding-left: 4px; padding-right: 4px; border: 1px solid #ccc; border-radius: 3px;">{{ $enrollment->classArm->yearLevel->yearLevelName }}</span> {{ $student->lrn ?? '' }}</div>
    </div>

    <!-- Billing Breakdown -->
    <div class="card2">
        <div class="section-title">Billing Breakdown</div>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="right">Amount</th>
                    <th class="right">Qty</th>
                    <th class="right">Discount</th>
                    <th class="right">Subtotal</th>
                    <th class="right">Balance</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($enrollment->billingItems as $item)
                    @php
                        $category = $item->category->name ?? '—';
                        $qty = $item->pivot->quantity ?? 1;
                        $amount = floatval($item->amount);
                        $subtotal = $amount * $qty;

                        $matchingDiscounts = $enrollment->billingDiscounts->filter(fn($d) => $d->category->name === $category);
                        $discountAmount = 0;
                        $discountLabel = '—';

                        if ($matchingDiscounts->isNotEmpty()) {
                            $labels = [];
                            foreach ($matchingDiscounts as $disc) {
                                if ($disc->value === 'fixed') {
                                    $discountAmount += floatval($disc->amount);
                                    $labels[] = '₱' . number_format($disc->amount, 2);
                                } else {
                                    $percent = floatval($disc->amount);
                                    $discountAmount += ($subtotal * $percent / 100);
                                    $labels[] = $percent . '%';
                                }
                            }
                            $discountLabel = implode(', ', $labels);
                        }

                        $net = $subtotal - $discountAmount;
                        $payments = $enrollment->payments->filter(fn($p) => $p->billing->description === $item->description);
                        $paid = $payments->sum(fn($p) => floatval($p->amount));
                        $balance = $net - $paid;
                    @endphp

                    <tr>
                        <td>{{ $category }}</td>
                        <td class="right">₱{{ number_format($amount, 2) }}</td>
                        <td class="right">x{{ $qty }}</td>
                        <td class="right">{{ $discountLabel }}</td>
                        <td class="right">₱{{ number_format($net, 2) }}</td>
                        <td class="right">₱{{ number_format(max($balance, 0), 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Installment Plan -->
    @php
        use Carbon\Carbon;

        $currentMonthNum = Carbon::now()->month;

        // Filter months from June (6) to March (3) only
        $filteredMonths = collect($months)->filter(function ($m) use ($currentMonthNum) {
            $monthNum = (int) $m['value'];

            // Include months from June (6) to December (12)
            if ($monthNum >= 6 && $monthNum <= 12) {
                return $monthNum <= $currentMonthNum;
            }

            // Include months from January (1) to March (3)
            if ($monthNum >= 1 && $monthNum <= 3) {
                return $currentMonthNum <= 3 && $monthNum <= $currentMonthNum;
            }

            return false;
        });
    @endphp

    <div class="card2">
        <div class="section-title">
            Balance Status (June to {{ $filteredMonths->last()['label'] ?? 'Present' }})
        </div>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    @foreach ($installments as $installment)
                        <th class="right">{{ $installment['category'] }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($filteredMonths as $month)
                    <tr>
                        <td>{{ $month['label'] }}</td>
                        @foreach ($installments as $installment)
                            @php $data = $installment['months'][$month['value']] ?? null; @endphp
                            <td class="right">
                                @if ($data)
                                    ₱{{ number_format($data['balance'], 2) }}
                                @else
                                    —
                                @endif
                            </td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            Total Due for <span
                style="background-color: #f6fb00ff; font-weight: bold;">{{ $filteredMonths->firstWhere('value', $currentMonth)['label'] ?? 'this month' }}:
                ₱{{ number_format($totalDueThisMonth, 2) }}</span>
        </div>
    </div>


    <!-- Payment Policy -->
    <div class="card">
        <div class="section-title">Payment Policy</div>
        <ul>
            <li>This Statement of Account shall be presented to the cashier.</li>
            <li>Payment(s) shall be made on or before the due dates or scheduled examination. <strong>Strictly "NO
                    PERMIT NO EXAM"</strong></li>
            <li>Payments made are applied to past dues before current ones.</li>
            <li>For queries, call <strong>(0997) 511 1026</strong>; ask for the Cashier.</li>
        </ul>
        <div class="footer-note">
            “THE FEAR OF THE LORD IS THE BEGINNING OF WISDOM”<br>
            <strong>PROVERBS 1:7</strong>
        </div>
    </div>

    <!-- Signature Section -->
    <div style="margin-top: 60px; text-align: right;">
        <div style="display: inline-block; text-align: center;">
            <div style="border-bottom: 1px solid #000; width: 200px; padding-bottom: 4px; margin-bottom: 4px;"></div>
            <div style="font-size: 12px;">MIRA LIZA L. MAGOLTA</div>
            <div style="font-size: 9.5px; font-style: italic;">Billing in charge</div>
        </div>
    </div>

    <!-- Footer -->
    <div class="fixed-footer">
        Generated on: {{ now()->format('F d, Y - h:i A') }}
    </div>

</body>

</html>