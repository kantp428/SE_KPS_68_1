import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Activity, ArrowRight, Clock, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function PatientHome() {
  const services = await prisma.service.findMany({
    where: { status: "AVAILABLE" },
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10">
      {/* Hero Section */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-sky-700 p-8 md:p-12 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
          <Activity className="w-96 h-96" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-6 flex flex-col items-start text-left">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            บริการการแพทย์แผนจีน
          </h1>
          <p className="text-emerald-50 text-base md:text-xl">
            เรามีบริการหลากหลายเพื่อส่งเสริมสุขภาพของคุณด้วยหลักแพทย์แผนจีน
            รักษาที่ต้นเหตุของโรคด้วยวิธีธรรมชาติบำบัด
          </p>
          <div className="pt-4">
            <Link href="/patient/appointment">
              <Button size="lg" className="h-12 px-6 shadow-xl hover:shadow-2xl transition-all bg-white text-emerald-700 hover:bg-emerald-50 rounded-full font-semibold text-base">
                เริ่มจองเลย <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Services Grid Section */}
      <div className="space-y-6 mt-6">
        <div>
          <h2 className="text-2xl font-bold text-sky-950 dark:text-foreground flex items-center gap-2">
            <PlusCircle className="text-emerald-600 h-6 w-6" />
            บริการที่คลินิกของเรา
          </h2>
          <p className="text-muted-foreground mt-1">
            รายการหน้าบริการทั้งหมดที่คุณสามารถนัดหมายได้
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-sky-200 dark:border-border">
            <p className="text-muted-foreground">ไม่มีบริการในระบบขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-card p-6 rounded-2xl shadow-sm border border-sky-100 dark:border-border hover:shadow-md hover:border-emerald-200 dark:hover:border-primary/50 transition-all flex flex-col"
              >
                <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                  <Activity className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-sky-900 dark:text-foreground mb-2 truncate" title={service.name}>
                  {service.name}
                </h3>

                <div className="mt-auto space-y-3 pt-4 border-t border-sky-50 dark:border-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" /> ระยะเวลาโดยประมาณ
                    </span>
                    <span className="font-medium text-sky-800 dark:text-sky-300">{service.duration_minute} นาที</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">ราคา</span>
                    <span className="font-bold text-emerald-600 text-lg">
                      ฿{Number(service.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
