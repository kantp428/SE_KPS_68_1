"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useFormContext } from "react-hook-form";

// ─── Options ──────────────────────────────────────────────────────────────────

const TONGUE_COLORS = ["ชมพูปกติ", "แดงเข้ม", "แดงซีด", "ม่วง", "น้ำเงินม่วง"];

const TONGUE_COATINGS = [
  "ขาวบาง",
  "ขาวหนา",
  "เหลืองบาง",
  "เหลืองหนา",
  "เทา",
  "ดำ",
  "ไม่มีฝ้า",
];

const TONGUE_MOISTURES = ["ชื้น", "แห้ง", "เปียกมาก", "แห้งมาก"];

const TONGUE_SHAPES = ["ปกติ", "บวม", "ผอมเล็ก", "แตกแยก", "แข็ง"];

const COATING_TCM: Record<string, string> = {
  ขาวบาง: "ลมเย็น · ปกติ",
  ขาวหนา: "ความเย็นสะสม",
  เหลืองบาง: "ความร้อนเริ่มต้น",
  เหลืองหนา: "ความร้อนสูง",
  เทา: "ความชื้น + เย็น",
  ดำ: "ความร้อนรุนแรง",
  ไม่มีฝ้า: "ชี่และเลือดพร่อง",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ใช้ภายใน <FormProvider> ของ react-hook-form
 * field path: healthProfile.tongue.*
 */
export function TongueInput() {
  const { control, watch } = useFormContext();

  const selectedCoating = watch("healthProfile.tongue.coating");

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          การตรวจลิ้น (ไม่บังคับ)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: สีลิ้น + ฝ้าลิ้น */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm">สีลิ้น</Label>
            <Controller
              control={control}
              name="healthProfile.tongue.color"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(v) => field.onChange(v || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสีลิ้น" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONGUE_COLORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">ฝ้าลิ้น</Label>
            <Controller
              control={control}
              name="healthProfile.tongue.coating"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(v) => field.onChange(v || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกฝ้าลิ้น" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONGUE_COATINGS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {selectedCoating && COATING_TCM[selectedCoating] && (
              <p className="text-xs text-amber-600">
                {COATING_TCM[selectedCoating]}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: ความชื้น + รูปร่าง */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm">ความชื้น</Label>
            <Controller
              control={control}
              name="healthProfile.tongue.moisture"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(v) => field.onChange(v || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกความชื้น" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONGUE_MOISTURES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">รูปร่างลิ้น</Label>
            <Controller
              control={control}
              name="healthProfile.tongue.shape"
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(v) => field.onChange(v || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกรูปร่าง" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONGUE_SHAPES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Row 3: Checkbox */}
        <div className="flex gap-6">
          <Controller
            control={control}
            name="healthProfile.tongue.cracks"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tongue-cracks"
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor="tongue-cracks"
                  className="text-sm cursor-pointer"
                >
                  มีรอยแตก
                </Label>
              </div>
            )}
          />

          <Controller
            control={control}
            name="healthProfile.tongue.toothMarks"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tongue-toothmarks"
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor="tongue-toothmarks"
                  className="text-sm cursor-pointer"
                >
                  มีรอยฟัน
                </Label>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
