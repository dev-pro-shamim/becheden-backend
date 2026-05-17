import SSLCommerzPayment from 'sslcommerz-lts';
import config from '../../config';
import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { SubscriptionPaymentModel } from './payment.model';

// generateTransactionId
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const randomString = Math.random().toString(36).substring(2, 12);
  return `${timestamp}-${randomString}`;
};

const store_id = config.ssl.store_id as string;
const store_password = config.ssl.store_password as string;
const is_live = false; // true for live, false for sandbox

// SSLCommerz init
const initializePayment = async ({
  total_amount,
  validation_url,
  tran_id,
}: {
  total_amount: number;
  validation_url: string;
  tran_id: string;
}) => {
  const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);

  const data = {
    total_amount,
    currency: 'BDT',
    tran_id, // Use unique tran_id for each API call
    success_url: `${validation_url}?tran_id=${tran_id}`,
    fail_url: config.ssl.fail_url as string,
    cancel_url: config.ssl.cancel_url as string,
    ipn_url: 'https://khaled-siddique.vercel.app',
    shipping_method: 'Courier',
    product_name: 'N/A.',
    product_category: 'N/A',
    product_profile: 'general',
    cus_name: 'N/A',
    cus_email: 'N/A',
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
    ship_name: 'N/A',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
  };

  try {
    const apiResponse = await sslcz.init(data);

    // Redirect the user to the payment gateway
    const gatewayPageURL = apiResponse.GatewayPageURL;

    if (gatewayPageURL) {
      return gatewayPageURL;
    } else {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        'Failed to generate payment gateway URL!',
      );
    }
  } catch {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An error occurred while processing payment!',
    );
  }
};

// validate Payment
const validateFromGatewayRaw = async (tran_id: string) => {
  const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);

  const validationResponse = await sslcz.transactionQueryByTransactionId({
    tran_id,
  });

  return validationResponse;
};

const validatePayment = async (tran_id: string) => {
  const validationResponse = await validateFromGatewayRaw(tran_id);

  let data;

  if (
    validationResponse.element[0].status === 'VALID' ||
    validationResponse.element[0].status === 'VALIDATED'
  ) {
    data = {
      status: 'Paid',
      gatewayResponse: validationResponse.element[0],
    };
  } else if (validationResponse.element[0].status === 'INVALID_TRANSACTION') {
    data = {
      status: 'Failed',
      gatewayResponse: validationResponse.element[0],
    };
  } else {
    data = {
      status: 'Failed',
      gatewayResponse: validationResponse.element[0],
    };
  }

  const updatedPayment = await SubscriptionPaymentModel.findOneAndUpdate(
    { transactionId: validationResponse.element[0].tran_id },
    data,
    { new: true },
  );

  if (!updatedPayment) {
    throw new AppError(httpStatus.NOT_MODIFIED, 'Payment not updated!');
  }

  if (data.status === 'Failed') {
    throw new AppError(httpStatus.EXPECTATION_FAILED, 'Payment failed!');
  }

  return updatedPayment;
};

export const paymentSslService = {
  generateTransactionId,
  initializePayment,
  validateFromGatewayRaw,
  validatePayment,
};
