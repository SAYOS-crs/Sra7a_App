import { customAlphabet } from "nanoid";
import { HashingService } from "../index.js";
import {
  del,
  Hget_all,
  Hset,
  RedisOTPprefix,
} from "../../repository/radis.repository.js";
import { EmailEvent } from "../../email/email.Event.js";
import { EmailType } from "../../email/email.subject.js";
import OTP_Templet from "../../email/email.templet.js";
import {
  BadRequstException,
  NotFoundException,
} from "../../responses/error.respons.js";
import { FindOne } from "../../repository/repository.js";
import { UserModel } from "../../../DB/index.js";
import { OTP_TTL } from "../../../../config/config.service.js";

export const GenerateOTP = () => {
  const result = customAlphabet("1234567890abcdef", 6);

  return result();
};

export const SendOTP = async ({
  Email,
  resendCount = 3,
  OTPtype = EmailType.WellcomeEmail,
}) => {
  try {
    // 1. generate otp
    const OTP = GenerateOTP();
    // 2. Create hash OTP
    const CipherOTP = await HashingService.Hash(OTP);
    // 3. send the Hashed OTP to Redis
    await Hset({
      key: RedisOTPprefix({ Email }),
      filds: { CipherOTP, resendCount },
      ttl: OTP_TTL,
    });
    // 4. emit the send email event / send otp to user
    EmailEvent.emit(OTPtype, {
      to: Email,
      html: OTP_Templet({ Email, OTP, subject: OTPtype }),
    });
  } catch (error) {
    throw BadRequstException({
      message: "error while sending OTP",
      extra: error,
    });
  }
};

export const VerifyOTP = async ({ Email, OTP }) => {
  // 0. check for user
  const user = await FindOne({
    module: UserModel,
    filter: { Email, ConfirmEmail: true },
  });
  if (!user) throw NotFoundException({ message: "Invalid Email" });
  // 1. get the OTP data from redis
  const { CipherOTP, resendCount } = await Hget_all({
    key: RedisOTPprefix({ Email }),
  });
  if (!CipherOTP)
    throw NotFoundException({ message: "we didnt send OTP to this email" });
  // 2. compare the otp
  const result = await HashingService.Compare({
    data: OTP,
    cipher: CipherOTP,
  });
  if (!result) throw BadRequstException({ message: "invalid OTP" });
  // 3. delete the otp after verify
  await del({ key: RedisOTPprefix({ Email }) });
  return { CipherOTP, resendCount };
};
