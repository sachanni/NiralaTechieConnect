import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

export const razorpay = (razorpayKeyId && razorpayKeySecret) 
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

const isRazorpayEnabled = razorpay !== null;

if (!isRazorpayEnabled) {
  console.warn('[Razorpay] Payment gateway disabled - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not configured');
}

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.');
  }
  
  try {
    const order = await razorpay.orders.create({
      amount: params.amount * 100, // Convert to smallest currency unit (paise)
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes,
    });

    return order;
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function verifyRazorpaySignature(params: VerifyPaymentParams): boolean {
  if (!razorpayKeySecret) {
    console.error('Razorpay is not configured - cannot verify payment signature');
    return false;
  }
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpay_signature;
  } catch (error: any) {
    console.error('Razorpay signature verification error:', error);
    return false;
  }
}

export function getRazorpayKeyId(): string | null {
  return razorpayKeyId || null;
}

export function isRazorpayConfigured(): boolean {
  return razorpay !== null;
}
