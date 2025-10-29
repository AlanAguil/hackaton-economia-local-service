import { HttpException, HttpStatus } from '@nestjs/common';
import { stringConstants } from 'src/utils/string.constant';

export class ValidationException extends HttpException {
  constructor(type: ValidationExceptionType, info?: string) {
    let message;
    if (type === ValidationExceptionType.WRONG_AUTH) {
      message = stringConstants.incorrectAuth;
    } else if (type === ValidationExceptionType.PAYMENT_EXCEEDS_TOTAL) {
      message = stringConstants.validationMessages.paymentExceedsTotal;
    } else if (type === ValidationExceptionType.INVALID_PAYMENT_AMOUNT) {
      message = stringConstants.validationMessages.invalidPaymentAmount;
    } else if (type === ValidationExceptionType.CANNOT_RETURN_TO_VERIFICATION) {
      message = stringConstants.validationMessages.cannotReturnToVerification;
    }
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export enum ValidationExceptionType {
  WRONG_AUTH,
  PAYMENT_EXCEEDS_TOTAL,
  INVALID_PAYMENT_AMOUNT,
  CANNOT_RETURN_TO_VERIFICATION,
}
