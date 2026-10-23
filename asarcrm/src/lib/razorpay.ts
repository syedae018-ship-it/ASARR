/**
 * ASARR AgencyOS - Razorpay Integration Module
 *
 * Implements client-side checkout initiation and server-side signature verification structures
 * complying with PCI-DSS and Razorpay best practices.
 *
 * Note: Payment orders and signature verifications must be derived server-side
 * (e.g. Supabase Edge Function `create-razorpay-order` and `verify-razorpay-payment`).
 */

export interface RazorpayOrderResponse {
  id: string; // razorpay order_id
  amount: number; // in paise (e.g. 100000 = ₹1,000)
  currency: string;
  receipt: string;
}

export interface RazorpayPaymentSuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentSuccessPayload) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
    };
  }
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script if not already present
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay checkout flow with secure order_id
 */
export async function openRazorpayCheckout({
  orderId,
  amountInRupees,
  invoiceNumber,
  clientName,
  clientEmail,
  clientPhone,
  onSuccess,
  onDismiss,
}: {
  orderId: string;
  amountInRupees: number;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  onSuccess: (paymentData: RazorpayPaymentSuccessPayload) => Promise<void> | void;
  onDismiss?: () => void;
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error("Unable to load Razorpay payment gateway SDK.");
  }

  // Use configured public key or sandbox identifier
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder_key";

  const options: RazorpayCheckoutOptions = {
    key: keyId,
    amount: Math.round(amountInRupees * 100), // paise
    currency: "INR",
    name: "ASARR Digital Agency",
    description: `Payment for Invoice ${invoiceNumber}`,
    order_id: orderId,
    prefill: {
      name: clientName,
      email: clientEmail,
      contact: clientPhone || "",
    },
    theme: {
      color: "#7A1B28",
    },
    handler: (response) => {
      onSuccess(response);
    },
    modal: {
      ondismiss: onDismiss,
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
