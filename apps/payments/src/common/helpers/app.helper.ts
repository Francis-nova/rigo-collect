export const generateRandomString = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateUniqueAlphaNumeric = (maxLength: number = 18): string => {
  const randomPart = Math.random().toString(36).substring(2); // alphanumeric
  const timestampPart = Date.now().toString(36); // compressed timestamp

  let unique = timestampPart + randomPart;

  // Ensure it's alphanumeric only
  unique = unique.replace(/[^a-zA-Z0-9]/g, '');

  // Trim or pad to required length
  if (unique.length > maxLength) {
    return unique.substring(0, maxLength);
  }

  // Very unlikely, but if shorter, append random chars
  while (unique.length < maxLength) {
    unique += Math.random().toString(36).charAt(2);
  }

  return unique;
};

export const cleanAmount = (amount: string): number => {
  // Remove commas and trim spaces
  const cleaned = amount.replace(/,/g, '').trim();

  // Convert to number and force 2 decimal places
  return parseFloat(parseFloat(cleaned).toFixed(2));
};


export const calculateVAT = (transferFee: number, vatRate: number = 7.5): { vat: number; totalFeeAmount: number } => {
  const vat = Number((transferFee * (vatRate / 100)).toFixed(2)); // Calculate VAT and round to 2 decimal places
  const totalFeeAmount = Number((transferFee + vat).toFixed(2)); // Calculate total amount including VAT and round to 2 decimal places

  return { vat, totalFeeAmount };
}

export const calculateBankTransferFee = (amount: number): number => {
  let fee: number;

  if (amount <= 5000) {
    fee = 500;
  } else if (amount <= 50000) {
    fee = 1000;
  } else {
    fee = 1000;
  }

  // Cap the fee at NGN 1000
  return Math.min(fee, 1000);
}
