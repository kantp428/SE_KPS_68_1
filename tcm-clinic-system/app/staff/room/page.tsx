"use client";

import { useNotify } from "@/app/hook/useNotify";
import { useRoom } from "@/app/hook/useRoom";
import { Room } from "@/types/room";
import {
  DoorIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import {
  App,
  Button,
  Card,
  Flex,
  Grid,
  Input,
  Skeleton,
  Space,
  Table,
  Tag,
  theme,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Title } = Typography;
const { useBreakpoint } = Grid;

const RoomPage = () => {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const router = useRouter();
  const screens = useBreakpoint();

  const isMobile = !screens.lg;

  const [page, setPage] = useState(0);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // เมื่อค้นหาใหม่ ให้กลับไปหน้า 1 เสมอ
    }, 500); // รอ 0.5 วินาที

    return () => clearTimeout(handler);
  }, [search]);

  const searchParam = debouncedSearch !== "" ? debouncedSearch : undefined;

  const { list, loading, fetchList, deleteRoom } = useRoom(
    page + 1,
    limit,
    searchParam,
  );
  const { success: successNoti, error: errorNoti } = useNotify();

  const columns: ColumnsType<Room> = [
    {
      title: "ชื่อห้อง",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text) => (
        <div style={{ textAlign: "left" }}>
          <Space>
            <DoorIcon size={20} weight="bold" />
            <span style={{ fontWeight: 500 }}>{text}</span>
          </Space>
        </div>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: !isMobile ? 250 : undefined,
      render: (status: string) => {
        const color = status === "AVAILABLE" ? "green" : "volcano";
        const label = status === "AVAILABLE" ? "เปิดใช้งาน" : "ปิดใช้งาน";
        return (
          <Tag
            color={color}
            style={{ borderRadius: "6px", padding: "2px 10px", marginRight: 0 }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: !isMobile ? 150 : undefined,
      render: (_, record: Room) => (
        <Space size="middle">
          <Tooltip title="แก้ไข" arrow>
            <Button
              type="link"
              icon={
                <PencilSimpleIcon
                  size={22}
                  color={token.colorIcon}
                  weight="fill"
                />
              }
              size="small"
              onClick={() => router.push(`/staff/room/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="ลบ" arrow>
            <Button
              type="link"
              icon={
                <TrashIcon size={22} color={token.colorError} weight="fill" />
              }
              danger
              size="small"
              onClick={() => {
                modal.confirm({
                  title: (
                    <Space size={12}>
                      <TrashIcon
                        size={24}
                        weight="fill"
                        style={{ color: token.colorError, paddingTop: "7px" }}
                      />
                      <span style={{ fontWeight: 600 }}>ยืนยันการลบข้อมูล</span>
                    </Space>
                  ),
                  icon: null,
                  content: (
                    <div style={{ paddingLeft: 36 }}>
                      {" "}
                      <Typography.Text>
                        คุณแน่ใจหรือไม่ว่าต้องการลบห้อง <b>"{record.name}"</b>?
                      </Typography.Text>
                      <br />
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "13px" }}
                      >
                        การกระทำนี้ไม่สามารถย้อนกลับได้
                      </Typography.Text>
                    </div>
                  ),
                  okText: "ลบ",
                  okType: "danger",
                  cancelText: "ยกเลิก",
                  cancelButtonProps: {
                    className: "btn-cancel-gray",
                  },
                  centered: true,
                  onOk: async () => {
                    try {
                      await deleteRoom(record.id);
                      successNoti("ลบข้อมูลสำเร็จ");
                      fetchList();
                    } catch (error) {
                      errorNoti("เกิดข้อผิดพลาดในการลบข้อมูล");
                    }
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "2px" }}>
      <Flex vertical gap="large" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap", // รองรับมือถือ
            gap: "12px",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            การจัดการห้องบำบัด
          </Title>

          <Space size="middle" style={{ width: isMobile ? "100%" : "auto" }}>
            <Input
              placeholder="ค้นหาชื่อห้อง..."
              prefix={
                <MagnifyingGlassIcon
                  size={18}
                  color={token.colorTextSecondary}
                />
              }
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: isMobile ? "100%" : 280 }}
            />

            <Button
              type="primary"
              icon={<PlusIcon size={15} weight="bold" />}
              onClick={() => router.push(`/staff/room/new`)}
            >
              เพิ่มห้อง
            </Button>
          </Space>
        </div>

        <Card variant="outlined" styles={{ body: { padding: 0 } }}>
          <Table
            columns={columns}
            dataSource={list?.data}
            rowKey="id"
            scroll={{ x: isMobile ? 600 : undefined }}
            components={{
              header: {
                cell: (props: any) => (
                  <th
                    {...props}
                    style={{
                      ...props.style,
                      backgroundColor: token.colorBgSolid,
                      color: "#ffffff",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  />
                ),
              },
            }}
            loading={{
              spinning: loading,
              indicator: <Skeleton active paragraph={{ rows: 5 }} />,
            }}
            pagination={{
              total: list?.pagination.total,
              pageSize: list?.pagination.limit,
              current: list?.pagination.page,
              showSizeChanger: false,
              onChange: (newPage) => {
                setPage(newPage - 1);
              },
            }}
          />
        </Card>
      </Flex>
    </div>
  );
};

export default RoomPage;
