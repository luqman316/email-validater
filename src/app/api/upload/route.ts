/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

import { stringify } from "csv-stringify/sync";
import { isValidEmail } from "@/app/utils/emailValidator";

type EmailRow = {
  email: string;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return NextResponse.json(
      { message: "No file uploaded or its empty." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let records: EmailRow[];
  try {
    records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // 🔥 allows inconsistent rows
    }) as EmailRow[];
  } catch (err: any) {
    console.error("❌ Server Error:", err.message);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
  //    catch (err) {
  //     return NextResponse.json({ message: 'Failed to parse CSV' }, { status: 500 });
  //   }

  const validEmails: { email: string }[] = [];

  for (const row of records) {
    const email = (row?.email || "").trim();
    if (!email) continue;

    try {
      const valid = await isValidEmail(email);
      if (valid) {
        validEmails.push({ email }); // ✅ Only valid emails
      }
    } catch (err) {
      // Do nothing for errors — skip
    }

    await delay(1200); // optional throttling
  }

  if (validEmails.length === 0) {
    return NextResponse.json(
      { message: "No valid emails found." },
      { status: 200 }
    );
  }

  const outputCsv = stringify(validEmails, {
    header: true,
    columns: ["email"],
  });

  return new NextResponse(outputCsv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="valid_emails.csv"',
    },
  });
}

// import { parse } from "csv-parse/sync";
// import { NextRequest, NextResponse } from "next/server";
// // import { isValidEmail } from '@/utils/emailValidator';
// import { isValidEmail } from "@/app/utils/emailValidator";
// import { createObjectCsvStringifier } from "csv-writer";

// function delay(ms: number): Promise<void> {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file: File | null = formData.get("file") as File;

//   if (!file)
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const csvText = buffer.toString("utf-8");

//   let rows: { email: string }[] = [];

//   try {
//     rows = parse(csvText, {
//       columns: true,
//       skip_empty_lines: true,
//       trim: true,
//     });
//   } catch (err) {
//     return NextResponse.json({ error: "Invalid CSV format" }, { status: 400 });
//   }

//   const seen = new Set<string>();
//   const validRows: { email: string }[] = [];
//   const invalidRows: { email: string }[] = [];
//   const duplicates: string[] = [];

//   for (const row of rows) {
//     const email = row.email.trim().toLowerCase();

//     if (seen.has(email)) {
//       duplicates.push(email);
//       continue;
//     }

//     seen.add(email);

//     await delay(1200);

//     const isValid = await isValidEmail(email);

//     if (isValid) validRows.push({ email });
//     else invalidRows.push({ email });
//   }

//   const allResults = [...validRows, ...invalidRows];
//   const csvStringifier = createObjectCsvStringifier({
//     header: [{ id: "email", title: "email" }],
//   });

//   const csv =
//     csvStringifier.getHeaderString() +
//     csvStringifier.stringifyRecords(allResults);

//   return new Response(csv, {
//     status: 200,
//     headers: {
//       "Content-Type": "text/csv",
//       "Content-Disposition": 'attachment; filename="processed_emails.csv"',
//       // 👇 Send result metadata in header
//       "X-Result-Total": rows.length.toString(),
//       "X-Result-Valid": validRows.length.toString(),
//       "X-Result-Invalid": invalidRows.length.toString(),
//       "X-Result-Duplicates": duplicates.length.toString(),
//     },
//   });
// }
