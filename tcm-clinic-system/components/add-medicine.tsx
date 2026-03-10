export default function AddMedicine() {
  const medIdLists = [];
  const invoiceId = 2;

  type AddMedicinePayload = {
    medId: number; // 1
    quantity: number; // 5
  }
  
  const onSubmit = (invoiceId: number, payload: AddMedicinePayload[]) => {
    // call hooks
  }
  
  return (
    <>
      <div>Hello World</div>
    </>
  );
}
