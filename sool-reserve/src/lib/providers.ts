// 결제·성인인증 공급자 추상화. 실제 공급자(PG사, 본인확인기관)는 계약 후 여기에 구현한다.
// PRIVATE_TEST에서는 Mock만 동작하고, 실제 키가 있어도 LIVE가 아니면 실결제 경로는 존재하지 않는다.
import { randomBytes } from "crypto";
import type { SalesMode } from "./settings";

export interface PaymentResult {
  ok: boolean;
  provider: string;
  externalRef: string;
  message?: string;
}

export interface PaymentProvider {
  name: string;
  charge(amount: number, orderNumber: string): Promise<PaymentResult>;
  refund(externalRef: string, amount: number): Promise<{ ok: boolean; message?: string }>;
}

export interface AgeVerificationProvider {
  name: string;
  // 실제 공급자는 리다이렉트/팝업 흐름 후 서버 콜백으로 결과를 받는다. Mock은 즉시 성인으로 응답.
  verify(): Promise<{ ok: boolean; isAdult: boolean; externalTx: string }>;
}

const mockPayment: PaymentProvider = {
  name: "mock",
  async charge(amount, orderNumber) {
    if (amount <= 0) return { ok: false, provider: "mock", externalRef: "", message: "결제 금액이 올바르지 않습니다." };
    return { ok: true, provider: "mock", externalRef: `MOCK-PAY-${orderNumber}-${randomBytes(3).toString("hex")}` };
  },
  async refund() {
    return { ok: true };
  },
};

const mockAge: AgeVerificationProvider = {
  name: "mock",
  async verify() {
    return { ok: true, isAdult: true, externalTx: `MOCK-AGE-${randomBytes(6).toString("hex")}` };
  },
};

export class ProviderUnavailable extends Error {}

export function getPaymentProvider(mode: SalesMode): PaymentProvider {
  if (mode === "PRIVATE_TEST") return mockPayment;
  if (mode === "LIVE" && process.env.PG_SECRET_KEY) {
    // TODO(3단계 계약 후): 계약한 PG사 SDK로 구현. 미구현 상태에서는 결제를 시도하지 않는다.
    throw new ProviderUnavailable("실제 PG 연동이 아직 구현되지 않았습니다.");
  }
  throw new ProviderUnavailable("결제 기능이 활성화되지 않았습니다.");
}

export function getAgeProvider(mode: SalesMode): AgeVerificationProvider {
  if (mode === "PRIVATE_TEST") return mockAge;
  if (mode === "LIVE" && process.env.AGE_VERIFICATION_SECRET) {
    throw new ProviderUnavailable("실제 성인 인증 연동이 아직 구현되지 않았습니다.");
  }
  throw new ProviderUnavailable("성인 인증 기능이 활성화되지 않았습니다.");
}

export const AGE_VERIFICATION_TTL_MS = 30 * 60 * 1000;
