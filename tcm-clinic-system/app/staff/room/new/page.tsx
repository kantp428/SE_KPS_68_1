// "use client";

// import { useNotify } from "@/app/hook/useNotify";
// import { createRoom } from "@/app/hook/useRoom";
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
//   Input,
//   Row,
//   Select,
//   Space,
//   theme,
//   Typography,
// } from "antd";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// const { Title } = Typography;

// const statusOptions = [
//   { label: "เปิดใช้งาน", value: "AVAILABLE" },
//   { label: "ปิดใช้งาน", value: "UNAVAILABLE" },
// ];

// const AddRoomPage = () => {
//   const { token } = theme.useToken();
//   const { modal } = App.useApp();
//   const [form] = Form.useForm();
//   const router = useRouter();
//   const { success: successNoti, error: errorNoti } = useNotify();
//   const [submitLoading, setSubmitLoading] = useState(false);

//   const onFinish = async (values: RoomFormValues) => {
//     modal.confirm({
//       title: (
//         <Space size={12}>
//           <CheckCircleIcon
//             size={25}
//             weight="fill"
//             style={{ color: token.colorSuccess, paddingTop: "7px" }}
//           />
//           <span style={{ fontWeight: 600 }}>ยืนยันการบันทึก</span>
//         </Space>
//       ),
//       icon: null,
//       content: (
//         <div style={{ paddingLeft: 36 }}>
//           {" "}
//           <Typography.Text>คุณต้องการบันทึกข้อมูลห้องใหม่?</Typography.Text>
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
//           await createRoom(values);
//           successNoti("เพิ่มข้อมูลห้องเรียบร้อยแล้ว");
//           router.push("/staff/room");
//         } catch (error) {
//           errorNoti("เพิ่มข้อมูลห้องล้มเหลว");
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
//             { title: "เพิ่มห้องใหม่" },
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

// export default AddRoomPage;
