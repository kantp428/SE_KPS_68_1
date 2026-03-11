"use client";

import {
  useFieldArray,
  useFormContext,
  Controller,
  FieldErrorsImpl,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// สมมติว่า type FormValues ถูกส่งต่อมาหรือนิยามใหม่ให้ตรงกัน
type FormValues = {
  tongue?: {
    color?: string;
    coating?: string;
    moisture?: string;
    shape?: string;
    cracks?: boolean;
    toothMarks?: boolean;
  };
  treatmentItems: {
    serviceId: number;
    roomId: number;
  }[];
};

interface Props {
  serviceOptions: { value: number; label: string }[];
  roomOptions: { value: number; label: string }[];
}

export const TreatmentItemForm = ({ serviceOptions, roomOptions }: Props) => {
  // ระบุ Generic <FormValues> เพื่อให้รู้จักโครงสร้าง data และ errors
  const {
    control,
    formState: { errors },
  } = useFormContext<FormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatmentItems",
  });

  // ใช้ FieldErrorsImpl ร่วมกับ Index เพื่อแก้ปัญหา 'any' type
  const itemErrors = errors.treatmentItems as unknown as FieldErrorsImpl<
    FormValues["treatmentItems"]
  >;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          เพิ่มบริการ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((fieldItem, index) => {
          // ดึง error ของแถวปัจจุบันออกมาล่วงหน้า
          const errorRow = itemErrors?.[index];

          return (
            <div
              key={fieldItem.id}
              className="grid grid-cols-[1fr_1fr_auto] items-end gap-3"
            >
              {/* บริการ */}
              <div className="space-y-1.5">
                <Label>บริการ #{index + 1}</Label>
                <Controller
                  control={control}
                  name={`treatmentItems.${index}.serviceId`}
                  render={({ field }) => (
                    <Select
                      value={field.value > 0 ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกบริการ" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((o) => (
                          <SelectItem key={o.value} value={String(o.value)}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errorRow?.serviceId && (
                  <p className="text-xs text-destructive">
                    {errorRow.serviceId.message}
                  </p>
                )}
              </div>

              {/* ห้อง */}
              <div className="space-y-1.5">
                <Label>ห้อง #{index + 1}</Label>
                <Controller
                  control={control}
                  name={`treatmentItems.${index}.roomId`}
                  render={({ field }) => (
                    <Select
                      value={field.value > 0 ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกห้อง" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomOptions.map((o) => (
                          <SelectItem key={o.value} value={String(o.value)}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errorRow?.roomId && (
                  <p className="text-xs text-destructive">
                    {errorRow.roomId.message}
                  </p>
                )}
              </div>

              {/* ปุ่มลบ */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ serviceId: 0, roomId: 0 })}
        >
          <Plus className="mr-2 h-4 w-4" /> เพิ่มบริการ
        </Button>
      </CardContent>
    </Card>
  );
};
