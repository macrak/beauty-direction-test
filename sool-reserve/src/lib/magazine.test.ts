import { describe, expect, it } from "vitest";
import { missingAdChecks, parseBody } from "./magazine";

describe("parseBody", () => {
  it("소제목·문단·인용·목록 파싱 (HTML은 텍스트로 유지)", () => {
    const b = parseBody("## 제목\n\n첫 문단\n이어짐\n\n> 인용문\n\n- 하나\n- 둘\n\n<script>x</script>");
    expect(b).toEqual([
      { type: "h2", text: "제목" },
      { type: "p", text: "첫 문단 이어짐" },
      { type: "quote", text: "인용문" },
      { type: "ul", items: ["하나", "둘"] },
      { type: "p", text: "<script>x</script>" },
    ]);
  });
});

describe("missingAdChecks", () => {
  it("체크리스트 미충족 항목 반환", () => {
    expect(missingAdChecks({ adCheckNoGlamour: true })).toHaveLength(4);
    expect(
      missingAdChecks({ adCheckNoGlamour: true, adCheckNoMinors: true, adCheckNoHealth: true, adCheckWarning: true, adCheckFacts: true }),
    ).toHaveLength(0);
  });
});
