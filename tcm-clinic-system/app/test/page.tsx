"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner"; 

type AddMedicinePayload = { medId: number; quantity: number; };
type FormValues = { items: AddMedicinePayload[]; };
type MedicineOption = { id: number; name: string; price: number; };

// 🌟 สร้าง Component ย่อยสำหรับ Dropdown แบบค้นหาได้
const MedicineCombobox = ({
  value,
  onChange,
  options,
}: {
  value: number;
  onChange: (value: number) => void;
  options: MedicineOption[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value > 0
            ? options.find((med) => med.id === value)?.name
            : "พิมพ์ค้นหาชื่อยา..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหายา..." />
          <CommandList>
            <CommandEmpty>ไม่พบชื่อยานี้</CommandEmpty>
            <CommandGroup>
              {options.map((med) => (
                <CommandItem
                  key={med.id}
                  value={med.name} 
                  onSelect={() => {
                    onChange(med.id);
                    setOpen(false); 
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === med.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {med.name} (฿{med.price})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function AddMedicine() {
  const invoiceId = 1; // ยังต้องเก็บไว้ส่งไปให้ API แต่ไม่ต้องโชว์ให้ User เห็นครับ
  const [medicineList, setMedicineList] = useState<MedicineOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await fetch('/api/invoice-med');
        const json = await res.json();
        setMedicineList(json.data || []);
      } catch (error) {
        toast.error("ดึงข้อมูลยาไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const { control, handleSubmit, formState: { isSubmitting }, reset } = useForm<FormValues>({
    defaultValues: { items: [{ medId: 0, quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({
    control, name: "items",
  });

  const onSubmitForm = async (data: FormValues) => {
    const payload = data.items.filter(item => item.medId > 0);
    
    if (payload.length === 0) {
      toast.warning("กรุณาเลือกยาอย่างน้อย 1 รายการ");
      return;
    }

    try {
      const res = await fetch('/api/invoice-med', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoiceId, items: payload })
      });

      const result = await res.json();
      
      if (res.ok) {
        toast.success(`บันทึกสำเร็จ! ยอดเงินเพิ่มขึ้น ฿${result.addedAmount}`);
        reset({ items: [{ medId: 0, quantity: 1 }] }); 
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  if (loading) return <div className="p-6">กำลังโหลดข้อมูลยา...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm max-w-2xl mx-auto mt-10">
      <h2 className="text-lg font-semibold">รายการจ่ายยา</h2>

      <div className="space-y-3">
        {fields.map((fieldItem, index) => (
          <div key={fieldItem.id} className="grid items-end gap-3 md:grid-cols-[2fr_1fr_auto]">
            
            <div className="space-y-2">
              <Label>ยาชนิดที่ #{index + 1}</Label>
              <Controller
                control={control}
                name={`items.${index}.medId`}
                render={({ field }) => (
                  <MedicineCombobox 
                    value={field.value} 
                    onChange={field.onChange} 
                    options={medicineList} 
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>จำนวน</Label>
              <Controller
                control={control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <Input
                    type="number" min="1"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </div>

            <Button type="button" variant="outline" onClick={() => remove(index)} disabled={fields.length <= 1}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={() => append({ medId: 0, quantity: 1 })}>
        <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการยา
      </Button>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
          {isSubmitting ? "กำลังคำนวณและบันทึก..." : "บันทึกการจ่ายยา"}
        </Button>
      </div>
    </form>
  );
}