/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { apiKey } from '../config/mailboxlayer';

interface AbstractEmailResponse {
  email: string;
  deliverability: 'DELIVERABLE' | 'UNDELIVERABLE' | 'UNKNOWN';
  quality_score?: string;
  is_valid_format?: {
    value: boolean;
    text: string;
  };
  [key: string]: any;
}

export async function isValidEmail(email: string): Promise<boolean> {
  try {
    const response = await axios.get<AbstractEmailResponse>(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
    );

    return response.data.deliverability === 'DELIVERABLE';
  } catch (err: any) {
    console.error(`Validation failed for ${email}: ${err.message}`);
    return false;
  }
}
