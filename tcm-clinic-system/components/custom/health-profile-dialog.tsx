"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealthProfile, Vitals } from "@/hooks/useHealthProfile";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealthProfileDialogProps {
  id: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TongueDiagnosis {
  color?: string;
  coating?: string;
  moisture?: string;
  shape?: string;
  cracks?: boolean;
  toothMarks?: boolean;
}

// ─── Configs ──────────────────────────────────────────────────────────────────

const VITALS_CONFIG: Record<string, { label: string; unit: string }> = {
  pulse: { label: "ชีพจร", unit: "ครั้ง/นาที" },
  temperature: { label: "อุณหภูมิ", unit: "°C" },
  respiratoryRate: { label: "อัตราการหายใจ", unit: "ครั้ง/นาที" },
  oxygenSaturation: { label: "ออกซิเจนในเลือด", unit: "%" },
  temp: { label: "อุณหภูมิ", unit: "°C" },
};

const COATING_TCM: Record<string, string> = {
  ขาวบาง: "ลมเย็น · ปกติ",
  ขาวหนา: "ความเย็นสะสม",
  เหลืองบาง: "ความร้อนเริ่มต้น",
  เหลืองหนา: "ความร้อนสูง",
  เทา: "ความชื้น + เย็น",
  ดำ: "ความร้อนรุนแรง",
  ไม่มีฝ้า: "ชี่และเลือดพร่อง",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcBMI(weight: string, height: string) {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h) return null;
  return (w / (h * h)).toFixed(1);
}

function bmiInfo(bmi: string | null): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  const val = parseFloat(bmi ?? "");
  if (isNaN(val)) return { label: "—", variant: "outline" };
  if (val < 18.5) return { label: "น้ำหนักน้อย", variant: "secondary" };
  if (val < 25) return { label: "ปกติ", variant: "default" };
  if (val < 30) return { label: "น้ำหนักเกิน", variant: "secondary" };
  return { label: "อ้วน", variant: "destructive" };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function extractTongue(vitals: Vitals): {
  tongue: TongueDiagnosis | null;
  rest: [string, number | null | undefined][];
} {
  const { tongue, ...remaining } = vitals as Vitals & {
    tongue?: TongueDiagnosis;
  };
  return {
    tongue: tongue ?? null,
    rest: Object.entries(remaining) as [string, number | null | undefined][],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </p>
  );
}

function StatItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}) {
  const display = value !== null && value !== undefined ? value : "—";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">
        {display}
        {value !== null && value !== undefined && unit && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function TongueCard({ tongue }: { tongue: TongueDiagnosis }) {
  const coatingMeaning = tongue.coating ? COATING_TCM[tongue.coating] : null;

  return (
    <Card>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {tongue.color && <StatItem label="สีลิ้น" value={tongue.color} />}
          {tongue.coating && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">ฝ้าลิ้น</span>
              <span className="text-sm font-semibold">{tongue.coating}</span>
              {coatingMeaning && (
                <span className="text-xs text-amber-600">{coatingMeaning}</span>
              )}
            </div>
          )}
          {tongue.moisture && (
            <StatItem label="ความชื้น" value={tongue.moisture} />
          )}
          {tongue.shape && (
            <StatItem label="รูปร่างลิ้น" value={tongue.shape} />
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant={tongue.cracks ? "destructive" : "outline"}>
            {tongue.cracks ? "✓" : "✗"} รอยแตก
          </Badge>
          <Badge variant={tongue.toothMarks ? "secondary" : "outline"}>
            {tongue.toothMarks ? "✓" : "✗"} รอยฟัน
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-20 rounded-lg" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HealthProfileDialog({
  id,
  open,
  onOpenChange,
}: HealthProfileDialogProps) {
  const { profile, loading, error } = useHealthProfile(id, open);

  const bmi = profile ? calcBMI(profile.weight, profile.height) : null;
  const { label: bmiLabel, variant: bmiVariant } = bmiInfo(bmi);
  const { tongue, rest } = profile
    ? extractTongue(profile.vitals)
    : { tongue: null, rest: [] };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-base">บันทึกการตรวจ</DialogTitle>
          {profile && (
            <p className="text-xs text-muted-foreground">
              ผู้ป่วย #{profile.patient_id} ·{" "}
              {formatDateTime(profile.date_time)}
            </p>
          )}
        </DialogHeader>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-5">
          {loading && <LoadingSkeleton />}

          {error && !loading && (
            <Card className="border-destructive">
              <CardContent className="pt-0 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          )}

          {profile && !loading && (
            <>
              {/* ── ร่างกาย ── */}
              <div className="space-y-2">
                <SectionLabel>สภาพร่างกาย</SectionLabel>
                <Card>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <StatItem
                        label="น้ำหนัก"
                        value={profile.weight}
                        unit="kg"
                      />
                      <StatItem
                        label="ส่วนสูง"
                        value={profile.height}
                        unit="cm"
                      />
                      <StatItem
                        label="ความดัน"
                        value={profile.bp}
                        unit="mmHg"
                      />
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <StatItem label="ดัชนีมวลกาย (BMI)" value={bmi ?? "—"} />
                      <Badge variant={bmiVariant}>{bmiLabel}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── อาการ ── */}
              <div className="space-y-2">
                <SectionLabel>อาการสำคัญ</SectionLabel>
                <Card>
                  <CardContent className="pt-0">
                    <p className="text-sm leading-relaxed">
                      {profile.symptoms || "—"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* ── สัญญาณชีพ ── */}
              {rest.length > 0 && (
                <div className="space-y-2">
                  <SectionLabel>สัญญาณชีพ</SectionLabel>
                  <Card>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {rest.map(([key, val]) => {
                          const cfg = VITALS_CONFIG[key] ?? {
                            label: key,
                            unit: "",
                          };
                          return (
                            <StatItem
                              key={key}
                              label={cfg.label}
                              value={val}
                              unit={cfg.unit}
                            />
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── การตรวจลิ้น ── */}
              {tongue && (
                <div className="space-y-2">
                  <SectionLabel>การตรวจลิ้น</SectionLabel>
                  <TongueCard tongue={tongue} />
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
