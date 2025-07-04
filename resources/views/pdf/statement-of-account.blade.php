<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>SOA - {{ $enrollment->student->lastName }}
    </title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: left;
            vertical-align: top;
        }

        th.text-center,
        td.text-center {
            text-align: center;
        }

        td.text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: bold;
        }

        .text-muted {
            color: #777;
        }

        .text-green {
            color: #256029;
        }

        .text-blue {
            color: #1c64f2;
        }

        .text-red {
            color: #b91c1c;
        }

        .text-xs {
            font-size: 10px;
        }
    </style>
</head>

<body>
    <div class="header" style="border-bottom: 2px solid #ccc; padding-bottom: 10px;">
        <table style="width: 100%; border: none; border-collapse: collapse;" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td style="width: 60px; border: none;">
                    <img src="{{ public_path('images/default-logo.png') }}" alt="School Logo" width="80" height="80"
                        style="object-fit: contain;">
                </td>
                <td style="text-align: left; vertical-align: middle; border: none;">
                    <div style="font-size: 16px; font-weight: bold; color: #222;">BLESSED TRINITY ACADEMY</div>
                    <div style="font-size: 13px;">blessed.opol@gmail.com</div>
                    <div style="font-size: 13px;">(0997) 511 1026</div>
                    <div style="font-size: 13px;">Zone 2, Malanang, Opol, Misamis Oriental</div>
                </td>
                <td style="text-align: right; vertical-align: middle; border: none;">
                    <div style="font-size: 20px; font-weight: bold; color: #222;">STATEMENT OF ACCOUNT</div>
                    <div style="font-size: 18px; font-weight: normal;">
                        S.Y. {{ $enrollment->classArm->yearLevel->schoolYear->name }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div>
        <table style="width: 100%; background-color: #f2f2f2; border: none; border-collapse: collapse;" border="0"
            cellpadding="0" cellspacing="0">
            <tr>
                <td style="text-align: left; border: none; vertical-align: middle;">
                    <div style="font-size: 14px; font-weight: bold; color:rgb(97, 97, 97);">Bill To</div>
                </td>
            </tr>
            <tr>
                <td style="text-align: left; border: none; vertical-align: middle;">
                    <div style="font-size: 13px; font-weight: bolder; color: #222;">
                        {{ $enrollment->student->firstName }}
                        {{ $enrollment->student->middleName ? $enrollment->student->middleName[0] . '.' : '' }}
                        {{ $enrollment->student->lastName }} {{ $enrollment->student->suffix }}
                    </div>
                    <div style="font-size: 13px; font-weight: lighter;">{{ $enrollment->student->lrn ?? '—' }}</div>
                    <div style="font-size: 13px font-weight: lighter;">
                        {{ $enrollment->classArm->yearLevel->yearLevelName }}
                    </div>
                    <div style="font-size: 13px font-weight: lighter;">
                        {{ $enrollment->classArm->classArmName }}
                    </div>
                </td>
            </tr>
            <!-- <tr>
                <td style="text-align: right; border: none; padding-top: 25px; vertical-align: middle;">
                    <div style="font-size: 14px; font-weight: bold; color:rgb(97, 97, 97);">Address</div>
                </td>
            </tr>
            <tr>
                <td style="text-align: right; border: none; vertical-align: middle;">
                    <div style="font-size: 13px font-weight: lighter;">-</div>
                    <div style="font-size: 13px font-weight: lighter;">-</div>
                    <div style="font-size: 13px font-weight: lighter;">-</div>
                </td>
            </tr> -->
        </table>
    </div>

    <table>
        <thead>
            {{-- Due today row (only Total Balance column, full row colored) --}}
            
            <tr style="text-align: left; padding: 10px; font-weight: lighter; font-size: 15px; background-color:rgb(242, 219, 87);"> {{-- Light yellow background --}}
                <td colspan="{{ collect($soaTableData)->filter(fn($r) => $r['category'] !== 'REGISTRATION')->count() + 1 }}"
                    class="text-right pr-4">
                    Due as of {{ $soaMonths[$currentMonthIndex] }}
                </td>
                <td class="text-right text-red font-bold pr-4">
                    Php {{
    number_format(
        collect($soaTableData)
            ->filter(fn($row) => $row['category'] !== 'REGISTRATION')
            ->reduce(function ($sum, $row) use ($currentMonthIndex) {
                return $sum + collect($row['monthlyStatus'])
                    ->slice(0, $currentMonthIndex + 1)
                    ->sum('balance');
            }, 0),
        2
    )
        }}
                </td>
            </tr>
            <tr>
                <th style="text-align: left; background-color: #f3f3f3; padding: 10px; font-weight: lighter; font-size: larger;"
                    colspan="5  ">Monthly Payment Summary</th>
            </tr>
            <tr>
                <th></th>
                @foreach($soaTableData as $row)
                    @if($row['category'] !== 'REGISTRATION')
                        <th class="text-center">{{ $row['category'] }}</th>
                    @endif
                @endforeach
                <th class="text-center">Total Balance</th>
            </tr>
        </thead>
        <tbody>
            @foreach($soaMonths as $i => $month)
                <tr>
                    <td>{{ $month }}</td>
                    @php $rowTotal = 0; @endphp

                    @foreach($soaTableData as $row)
                        @if($row['category'] !== 'REGISTRATION')
                            @if($i <= $currentMonthIndex)
                                @php
                                    $paid = $row['monthlyStatus'][$i]['paid'];
                                    $balance = $row['monthlyStatus'][$i]['balance'];
                                    $rowTotal += $balance;
                                @endphp
                                <td class="text-right">
                                    <div class="text-green text-s">{{ number_format($paid, 2) }}</div>
                                    <div class="text-red text-s">{{ number_format($balance, 2) }}</div>
                                </td>
                            @else
                                <td class="text-center text-muted">—</td>
                            @endif
                        @endif
                    @endforeach

                    {{-- Total per row (month) --}}
                    @if($i <= $currentMonthIndex)
                        <td class="text-right font-bold text-red">{{ number_format($rowTotal, 2) }}</td>
                    @else
                        <td class="text-center text-muted">—</td>
                    @endif
                </tr>
            @endforeach



        </tbody>
    </table>

    <table>
        <thead>
            <tr>
                <th style="text-align: left; background-color: #f3f3f3; padding: 10px; font-weight: lighter; font-size: larger;"
                    colspan="6">Billing Summary</th>
            </tr>
            <tr>
                <th>Item</th>
                <th>Amount</th>
                <th>Discounts</th>
                <th>Total Payable</th>
                <th>Paid</th>
                <th>Remaining</th>
            </tr>
        </thead>
        <tbody>
            @foreach($groupedSummary as $item)
                <tr>
                    <td>{{ $item['category'] }}</td>
                    <td class="text-right"> {{ number_format($item['billingAmount'], 2) }}</td>
                    <td>
                        @if(count($item['discountDescriptions']))
                            @foreach($item['discountDescriptions'] as $desc)
                                <div>
                                    — <span>{{ number_format($desc['amount'], 2) }}</span>
                                    ( {{ $desc['description'] }} )
                                </div>
                            @endforeach
                        @else
                            <span class="text-muted">—</span>
                        @endif
                    </td>
                    <td class="text-right"> {{ number_format($item['totalAfterDiscount'], 2) }}</td>
                    <td class="text-right"> {{ number_format($item['paidAmount'], 2) }}</td>
                    <td class="text-right text-red"> {{ number_format($item['remaining'], 2) }}</td>
                </tr>
            @endforeach
            <tr>
                <td colspan="3" class="text-right font-bold">TOTAL</td>
                <td class="text-right font-bold text-green">Php
                    {{ number_format(array_sum(array_column($groupedSummary, 'totalAfterDiscount')), 2) }}
                </td>
                <td class="text-right font-bold text-blue">Php {{ number_format($totalPaid, 2) }}</td>
                <td class="text-right font-bold text-red">Php {{ number_format($remainingBalance, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 30px; font-size: 13px;">
        <div style="background-color: #f3f3f3; padding: 5px; font-weight: bold;">
            PAYMENT POLICY
        </div>

        <ul style="list-style-type: decimal; padding-left: 20px; margin: 10px 0;">
            <li style="margin-bottom: 8px;">
                This Statement of Account shall be presented to the cashier.
            </li>
            <li style="margin-bottom: 8px;">
                Payment(s) shall be made on or before the due dates or scheduled examination.
                <strong>Strictly "NO PERMIT NO EXAM"</strong>
            </li>
            <li style="margin-bottom: 8px;">
                It is also understood that payment(s) made are for current accounts that are due;
                otherwise, they shall be applied first to any past due account.
            </li>
            <li style="margin-bottom: 8px;">
                For queries or clarifications, please call
                <strong>(0997) 511 1026</strong>; ask for the Cashier.
            </li>
        </ul>

        <div style="text-align: center; font-style: italic; color: #444; margin-top: 15px;">
            “THE FEAR OF THE LORD IS THE BEGINNING OF WISDOM”<br>
            <strong>PROVERBS 1:7</strong>
        </div>
    </div>


    <div style="
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 12px;
    color: #555;
    border-top: 1px solid #ccc;
    padding-top: 10px;
">
        <div>This document is system-generated and does not require a signature.</div>
    </div>

</body>

</html>