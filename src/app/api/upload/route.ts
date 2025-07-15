/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextRequest, NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';
// import { parse } from 'csv-parse/sync';
// import { isValidEmail } from '@/app/utils/emailValidator';

// type EmailRow = {
//   email: string;
// };

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get('file') as File;

//   if (!file) {
//     return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
//   }

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const logPath = path.join(process.cwd(), 'logs/processed.txt');
//   const logStream = fs.createWriteStream(logPath, { flags: 'a' });

//   let records: EmailRow[];

//   try {
//     records = parse(buffer, {
//       columns: true,
//       skip_empty_lines: true,
//       trim: true,
//     }) as EmailRow[];
//   } catch (error) {
//     return NextResponse.json({ message: 'Failed to parse CSV.' }, { status: 500 });
//   }

//   for (const row of records) {
//     const email = row.email?.trim();
//     if (!email) continue;

//     try {
//       const valid = await isValidEmail(email);
//       if (valid) {
//         console.log(`Valid: ${email}`);
//         logStream.write(`Valid: ${email}\n`);
//       } else {
//         console.log(`Invalid: ${email}`);
//         logStream.write(`Invalid: ${email}\n`);
//       }
//     } catch (err: any) {
//       console.error(`Error processing ${email}: ${err.message}`);
//       logStream.write(`Error: ${email} - ${err.message}\n`);
//     }

//     await delay(1200);
//   }

//   logStream.end();

//   return NextResponse.json({ message: 'Emails processed successfully.' });
// }

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
