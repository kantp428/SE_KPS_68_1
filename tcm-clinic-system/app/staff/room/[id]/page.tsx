// "use client";

// import { useNotify } from "@/app/hook/useNotify";
// import { updateRoom, useRoom } from "@/app/hook/useRoom";
// import { RoomFormValues } from "@/types/room";
// import {
//   CaretLeftIcon,
//   CheckCircleIcon,
//   DoorIcon,
//   FloppyDiskIcon,
// } from "@phosphor-icons/react";
// import {
//   App,
//   Breadcrumb,
//   Button,
//   Card,
//   Col,
//   Flex,
//   Form,
//   Space,
//   Input,
//   Row,
//   Select,
//   Skeleton,
//   Typography,
//   theme,
// } from "antd";
// import { useRouter, useParams } from "next/navigation";
// import { useEffect, useState } from "react";

// const { Title } = Typography;

// const statusOptions = [
//   { label: "เปิดใช้งาน", value: "AVAILABLE" },
//   { label: "ปิดใช้งาน", value: "UNAVAILABLE" },
// ];

// const EditRoomPage = () => {
//   const { token } = theme.useToken();
//   const { modal } = App.useApp();
//   const params = useParams();
//   const router = useRouter();

//   const id = params.id as string;
//   const numericId = parseInt(id);

//   const [form] = Form.useForm();
//   const { success: successNoti, error: errorNoti } = useNotify();
//   const [submitLoading, setSubmitLoading] = useState(false);

//   const { detail, loading, fetchOne } = useRoom();

//   useEffect(() => {
//     if (numericId) {
//       fetchOne(numericId);
//     }
//   }, [numericId]);

//   useEffect(() => {
//     if (detail) {
//       form.setFieldsValue(detail);
//     }
//   }, [detail, form]);

//   if (loading) {
//     return (
//       <div>
//         <Skeleton />
//       </div>
//     );
//   }

//   const onFinish = async (values: RoomFormValues) => {
//     modal.confirm({
//       title: (
//         <Space size={12}>
//           <CheckCircleIcon
//             size={25}
//             weight="fill"
//             style={{ color: token.colorSuccess, paddingTop: "7px" }}
//           />
//           <span style={{ fontWeight: 600 }}>ยืนยันการแก้ไข</span>
//         </Space>
//       ),
//       icon: null,
//       content: (
//         <div style={{ paddingLeft: 36 }}>
//           {" "}
//           <Typography.Text>คุณต้องการบันทึกการแก้ไขใช่หรือไม่?</Typography.Text>
//         </div>
//       ),
//       okText: "ยืนยัน",
//       okType: "primary",
//       cancelText: "ยกเลิก",
//       cancelButtonProps: {
//         className: "btn-cancel-gray",
//       },
//       centered: true,
//       onOk: async () => {
//         setSubmitLoading(true);
//         try {
//           await updateRoom(numericId, values);
//           successNoti("แก้ไขข้อมูลสำเร็จ");
//           router.push("/staff/room");
//         } catch (error) {
//           errorNoti("แก้ไขข้อมูลไม่สำเร็จ");
//         } finally {
//           setSubmitLoading(false);
//         }
//       },
//     });
//   };

//   return (
//     <div style={{ padding: "4px" }}>
//       <Flex vertical gap="middle">
//         <Breadcrumb
//           items={[
//             { title: "หน้าแรก", href: "/staff/dashboard" },
//             { title: "จัดการห้องบำบัด", href: "/staff/room" },
//             { title: "แก้ไขห้อง" },
//           ]}
//         />

//         <Flex justify="space-between" align="center">
//           <Title level={3} style={{ margin: 0 }}>
//             เพิ่มห้องบำบัดใหม่
//           </Title>
//           <Button
//             type="text"
//             icon={<CaretLeftIcon size={18} />}
//             onClick={() => router.back()}
//             disabled={submitLoading}
//           >
//             ย้อนกลับ
//           </Button>
//         </Flex>

//         <Card variant="outlined">
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={onFinish}
//             initialValues={{ status: "AVAILABLE" }}
//           >
//             <Row gutter={[24, 0]}>
//               <Col xs={24} md={12}>
//                 <Form.Item
//                   label="ชื่อห้อง"
//                   name="name"
//                   rules={[{ required: true, message: "กรุณากรอกชื่อห้อง" }]}
//                 >
//                   <Input
//                     prefix={<DoorIcon size={18} />}
//                     placeholder="ตัวอย่าง: Room A-101"
//                     disabled={submitLoading}
//                   />
//                 </Form.Item>
//               </Col>

//               <Col xs={24} md={12}>
//                 <Form.Item
//                   label="สถานะการใช้งาน"
//                   name="status"
//                   rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
//                 >
//                   <Select
//                     options={statusOptions}
//                     placeholder="เลือกสถานะห้อง"
//                     disabled={submitLoading}
//                   />
//                 </Form.Item>
//               </Col>
//             </Row>

//             <Flex justify="flex-end" style={{ marginTop: 24 }}>
//               <Form.Item style={{ marginBottom: 0 }}>
//                 <Button
//                   type="primary"
//                   htmlType="submit"
//                   icon={<FloppyDiskIcon size={18} weight="fill" />}
//                   size="large"
//                   style={{ minWidth: 120 }}
//                   loading={submitLoading}
//                 >
//                   บันทึกข้อมูล
//                 </Button>
//               </Form.Item>
//             </Flex>
//           </Form>
//         </Card>
//       </Flex>
//     </div>
//   );
// };

// export default EditRoomPage;
