import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getHomePath() {
  const session = await getSession();

  if (!session?.sub) {
    return "/";
  }

  const account = await prisma.account.findUnique({
    where: { id: Number(session.sub) },
    include: {
      staff: true,
    },
  });

  if (!account) {
    return "/";
  }

  if (account.account_role === "PATIENT") {
    return "/patient";
  }

  if (
    account.account_role === "STAFF" &&
    account.staff?.staff_role === "DOCTOR"
  ) {
    return "/doctor";
  }

  if (
    account.account_role === "STAFF" &&
    account.staff?.staff_role === "MED_ASSISTANT"
  ) {
    return "/med-assist";
  }

  return "/";
}

export default async function NotFound() {
  const homePath = await getHomePath();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#f3f9ff] px-4 py-6 sm:px-6 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(102,177,255,0.22),transparent_38%),linear-gradient(180deg,#f8fcff_0%,#edf6ff_100%)]" />
      <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-sky-200/30 blur-3xl sm:-left-24 sm:top-20 sm:h-72 sm:w-72" />
      <div className="absolute -right-20 bottom-8 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl sm:-right-24 sm:bottom-10 sm:h-80 sm:w-80" />

      <section className="relative z-10 flex w-full max-w-xl flex-col items-center rounded-[28px] border border-sky-100 bg-white/90 px-5 py-10 text-center shadow-[0_24px_70px_rgba(93,146,201,0.16)] backdrop-blur sm:max-w-2xl sm:rounded-[36px] sm:px-10 sm:py-14">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-500 sm:mb-4 sm:text-sm sm:tracking-[0.45em]">
          Not Found
        </p>

        <h1 className="text-[82px] font-black leading-none tracking-[-0.08em] text-sky-300 sm:text-[120px] md:text-[150px]">
          404
        </h1>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:mt-4 sm:text-4xl">
          ไม่พบหน้าที่คุณต้องการ
        </h2>

        <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:max-w-xl sm:text-base">
          หน้านี้อาจถูกย้าย ลบออก หรือคุณอาจไม่มีสิทธิ์เข้าถึง
          กรุณาตรวจสอบอีกครั้ง หรือกลับไปที่หน้าแรกเพื่อเริ่มต้นใหม่
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-sky-600 px-8 text-white hover:bg-sky-700 sm:min-w-44 sm:w-auto"
          >
            <Link href={homePath}>กลับหน้าแรก</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
