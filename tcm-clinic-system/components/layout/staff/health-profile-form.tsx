// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader2 } from "lucide-react";
// import { useForm } from "react-hook-form";
// import * as z from "zod";

// const healthProfileSchema = z.object({
//   patientId: z.coerce.number().int().positive("กรุณากรอก patientId ให้ถูกต้อง"),
//   weight: z.coerce.number().positive("น้ำหนักต้องมากกว่า 0"),
//   height: z.coerce.number().positive("ส่วนสูงต้องมากกว่า 0"),
//   bp: z.coerce.number().int().positive("ความดันต้องมากกว่า 0"),
//   symptoms: z.string().min(1, "กรุณากรอกอาการ"),
//   temperature: z.coerce.number().optional(),
//   pulse: z.coerce.number().optional(),
//   respiratoryRate: z.coerce.number().optional(),
//   oxygenSaturation: z.coerce.number().optional(),
// });

// export type HealthProfileFormInput = z.infer<typeof healthProfileSchema>;
// type HealthProfileFormSchemaInput = z.input<typeof healthProfileSchema>;
// type HealthProfileFormSchemaOutput = z.output<typeof healthProfileSchema>;

// export type HealthProfileSubmitPayload = {
//   patientId: number;
//   weight: number;
//   height: number;
//   bp: number;
//   symptoms: string;
//   vitals: {
//     temperature: number | null;
//     pulse: number | null;
//     respiratoryRate: number | null;
//     oxygenSaturation: number | null;
//   };
// };

// type HealthProfileFormProps = {
//   isSubmitting?: boolean;
//   onCancel?: () => void;
//   onSubmit: (payload: HealthProfileSubmitPayload) => void | Promise<void>;
//   defaultValues?: Partial<HealthProfileFormInput>;
//   submitText?: string;
// };

// export function HealthProfileForm({
//   isSubmitting = false,
//   onCancel,
//   onSubmit,
//   defaultValues,
//   submitText = "บันทึกข้อมูล",
// }: HealthProfileFormProps) {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<
//     HealthProfileFormSchemaInput,
//     unknown,
//     HealthProfileFormSchemaOutput
//   >({
//     resolver: zodResolver(healthProfileSchema),
//     defaultValues: {
//       patientId: defaultValues?.patientId,
//       weight: defaultValues?.weight,
//       height: defaultValues?.height,
//       bp: defaultValues?.bp,
//       symptoms: defaultValues?.symptoms ?? "",
//       temperature: defaultValues?.temperature,
//       pulse: defaultValues?.pulse,
//       respiratoryRate: defaultValues?.respiratoryRate,
//       oxygenSaturation: defaultValues?.oxygenSaturation,
//     },
//   });

//   const submitForm = async (values: HealthProfileFormSchemaOutput) => {
//     await onSubmit({
//       patientId: values.patientId,
//       weight: values.weight,
//       height: values.height,
//       bp: values.bp,
//       symptoms: values.symptoms,
//       vitals: {
//         temperature: values.temperature ?? null,
//         pulse: values.pulse ?? null,
//         respiratoryRate: values.respiratoryRate ?? null,
//         oxygenSaturation: values.oxygenSaturation ?? null,
//       },
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
//       <div className="grid gap-4 md:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="patientId">Patient ID</Label>
//           <Input
//             id="patientId"
//             type="number"
//             placeholder="เช่น 1"
//             {...register("patientId")}
//             className={errors.patientId ? "border-destructive" : ""}
//             disabled={isSubmitting}
//           />
//           {errors.patientId && (
//             <p className="text-xs text-destructive">{errors.patientId.message}</p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="bp">BP</Label>
//           <Input
//             id="bp"
//             type="number"
//             placeholder="เช่น 120"
//             {...register("bp")}
//             className={errors.bp ? "border-destructive" : ""}
//             disabled={isSubmitting}
//           />
//           {errors.bp && (
//             <p className="text-xs text-destructive">{errors.bp.message}</p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="weight">Weight (kg)</Label>
//           <Input
//             id="weight"
//             type="number"
//             step="0.01"
//             placeholder="เช่น 60.5"
//             {...register("weight")}
//             className={errors.weight ? "border-destructive" : ""}
//             disabled={isSubmitting}
//           />
//           {errors.weight && (
//             <p className="text-xs text-destructive">{errors.weight.message}</p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="height">Height (cm)</Label>
//           <Input
//             id="height"
//             type="number"
//             step="0.01"
//             placeholder="เช่น 170"
//             {...register("height")}
//             className={errors.height ? "border-destructive" : ""}
//             disabled={isSubmitting}
//           />
//           {errors.height && (
//             <p className="text-xs text-destructive">{errors.height.message}</p>
//           )}
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="symptoms">Symptoms</Label>
//         <textarea
//           id="symptoms"
//           placeholder="กรอกอาการของผู้ป่วย"
//           {...register("symptoms")}
//           className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
//           disabled={isSubmitting}
//         />
//         {errors.symptoms && (
//           <p className="text-xs text-destructive">{errors.symptoms.message}</p>
//         )}
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         <div className="space-y-2">
//           <Label htmlFor="temperature">Temperature (°C)</Label>
//           <Input
//             id="temperature"
//             type="number"
//             step="0.1"
//             placeholder="เช่น 36.8"
//             {...register("temperature")}
//             disabled={isSubmitting}
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="pulse">Pulse (bpm)</Label>
//           <Input
//             id="pulse"
//             type="number"
//             placeholder="เช่น 72"
//             {...register("pulse")}
//             disabled={isSubmitting}
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
//           <Input
//             id="respiratoryRate"
//             type="number"
//             placeholder="เช่น 16"
//             {...register("respiratoryRate")}
//             disabled={isSubmitting}
//           />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="oxygenSaturation">SpO2 (%)</Label>
//           <Input
//             id="oxygenSaturation"
//             type="number"
//             placeholder="เช่น 98"
//             {...register("oxygenSaturation")}
//             disabled={isSubmitting}
//           />
//         </div>
//       </div>

//       <div className="flex gap-3 pt-2">
//         {onCancel && (
//           <Button
//             type="button"
//             variant="outline"
//             className="flex-1"
//             onClick={onCancel}
//             disabled={isSubmitting}
//           >
//             ยกเลิก
//           </Button>
//         )}
//         <Button type="submit" className="flex-1" disabled={isSubmitting}>
//           {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitText}
//         </Button>
//       </div>
//     </form>
//   );
// }
