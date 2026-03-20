"use client";

import {
  Controller,
  FieldErrorsImpl,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const {
    control,
    formState: { errors },
  } = useFormContext<FormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatmentItems",
  });

  const itemErrors = errors.treatmentItems as unknown as FieldErrorsImpl<
    FormValues["treatmentItems"]
  >;

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-muted-foreground">
        รายการรักษา
      </h2>

      <div className="space-y-3">
        {fields.map((fieldItem, index) => {
          const errorRow = itemErrors?.[index];

          return (
            <div
              key={fieldItem.id}
              className="grid items-end gap-3 md:grid-cols-[2fr_2fr_auto]"
            >
              <div className="space-y-2">
                <Label>บริการที่ {index + 1}</Label>
                <Controller
                  control={control}
                  name={`treatmentItems.${index}.serviceId`}
                  render={({ field }) => (
                    <Select
                      value={field.value > 0 ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกบริการ" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
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

              <div className="space-y-2">
                <Label>ห้อง</Label>
                <Controller
                  control={control}
                  name={`treatmentItems.${index}.roomId`}
                  render={({ field }) => (
                    <Select
                      value={field.value > 0 ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกห้อง" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
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

              <Button
                type="button"
                variant="outline"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => append({ serviceId: 0, roomId: 0 })}
      >
        <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการรักษา
      </Button>
    </div>
  );
};
