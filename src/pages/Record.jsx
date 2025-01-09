import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Space,
  Table,
  Typography,
  Modal,
  message,
  Form,
  Dropdown,
  Menu,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Title } = Typography;

const api_uri = "https://insurance-agenta-server.onrender.com/api/records";

const Record = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(api_uri);
      const recordsWithKeys = response.data.data.map((record, index) => ({
        ...record,
        key: record._id,
        rno: `${(index + 1).toString().padStart(3, "0")}`,
      }));
      setData(recordsWithKeys);
      setFilteredData(recordsWithKeys);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch records");
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    const filteredResults = data.filter(
      (item) =>
        item.rno.toLowerCase().includes(value) ||
        item.vehicleNumber.toLowerCase().includes(value) ||
        item.vehicleName.toLowerCase().includes(value) ||
        item.policy.toLowerCase().includes(value) ||
        item.ownerName.toLowerCase().includes(value)
    );
    setFilteredData(filteredResults);
  };

  const handleDelete = (record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord || !selectedRecord._id) {
      message.error("Record not found");
      return;
    }

    try {
      await axios.delete(`${api_uri}/${selectedRecord._id}`);
      await fetchRecords();
      setIsDeleteModalOpen(false);
      message.success("Record deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete record");
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue(record); // Populate form with record data
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = async () => {
    try {
      const updatedRecord = form.getFieldsValue();
      await axios.put(`${api_uri}/${selectedRecord._id}`, updatedRecord);
      await fetchRecords();
      setIsEditModalOpen(false);
      message.success("Record updated successfully");
    } catch (error) {
      console.error("Edit error:", error);
      message.error("Failed to update record");
    }
  };

  const columns = [
    {
      title: "Vehicle No.",
      dataIndex: "vehicleNumber",
      key: "vehicleNumber",
    },
    {
      title: "Vehicle Name",
      dataIndex: "vehicleName",
      key: "vehicleName",
    },
    {
      title: "Policy",
      dataIndex: "policy",
      key: "policy",
    },
    {
      title: "Owner Name",
      dataIndex: "ownerName",
      key: "ownerName",
    },
    {
      title: "Insurance Type",
      dataIndex: "insType",
      key: "insType",
    },
    {
      title: "Insurance Price",
      dataIndex: "insPrice",
      key: "insPrice",
      render: (text) => `₹${text.toLocaleString()}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Companies");
    XLSX.writeFile(workbook, "Companies.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["C.No", "Name", "Agent Name", "Licence"];
    const tableRows = data.map((item) => [
      item.cno,
      item.name,
      item.agentName || "-",
      item.licence || "-",
    ]);

    doc.text("Companies Report", 14, 10);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("Companies.pdf");
  };

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Title align="start" level={3} style={{ margin: 0 }}>
          Records
        </Title>
        <Space style={{ flexWrap: "wrap" }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: "excel",
                  label: "Export to Excel",
                  onClick: exportToExcel,
                },
                { key: "pdf", label: "Export to PDF", onClick: exportToPDF },
              ],
            }}
            trigger={["click"]}
          >
            <Button type="default" icon={<DownloadOutlined />}>
              Export Data
            </Button>
          </Dropdown>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => (window.location.href = "/addRecord")}
          />
        </Space>
      </Space>

      <Input
        placeholder="Search records..."
        prefix={<SearchOutlined />}
        onChange={handleSearch}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />

      <Table
        columns={columns}
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => handleView(record),
        })}
        pagination={{
          pageSize,
          onChange: (_, size) => setPageSize(size),
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        loading={loading}
        scroll={{ x: "max-content" }}
      />

      {/* View Modal */}
      <Modal
        title="Record Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        centered
      >
        {selectedRecord && (
          <div>
            <p className=" text-primary/80 font-semibold text-xl py-2">
              <b className=" text-gray-700 font-medium text-base">
                Vehicle No:
              </b>{" "}
              {selectedRecord.vehicleNumber}
            </p>
            <p className=" text-slate-800 font-semibold text-xl py-2">
              <b className=" text-gray-700 font-medium text-base">
                Vehicle Name:
              </b>{" "}
              {selectedRecord.vehicleName}
            </p>
            <p className=" text-slate-800 font-semibold text-xl py-2">
              <b className=" text-gray-700 font-medium text-base">Policy:</b>{" "}
              {selectedRecord.policy}
            </p>
            <p className=" text-slate-800 font-semibold text-xl py-2">
              <b className=" text-gray-700 font-medium text-base">
                Owner Name:
              </b>{" "}
              {selectedRecord.ownerName}
            </p>
            <p className=" text-slate-800 font-semibold text-xl py-2">
              <b className=" text-gray-700 font-medium text-base">
                Insurance Type:
              </b>{" "}
              {selectedRecord.insType}
            </p>
            <p className=" text-slate-800 font-semibold text-xl py-2">
              <b className=" text-gray-700 font-medium text-base">
                Insurance Price:
              </b>{" "}
              ₹{selectedRecord.insPrice.toLocaleString()}
            </p>
            <Space size="middle">
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(selectedRecord)}
              />
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(selectedRecord)}
              />
            </Space>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Record"
        closable={false}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleEditConfirm}
        okText="Update"
        cancelText="Cancel"
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Vehicle No."
            name="vehicleNumber"
            rules={[{ required: true, message: "Please enter vehicle number" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Vehicle Name"
            name="vehicleName"
            rules={[{ required: true, message: "Please enter vehicle name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Policy" name="policy">
            <Input />
          </Form.Item>
          <Form.Item label="Owner Name" name="ownerName">
            <Input />
          </Form.Item>
          <Form.Item label="Insurance Type" name="insType">
            <Input />
          </Form.Item>
          <Form.Item label="Insurance Price" name="insPrice">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Are you sure you want to delete this record?"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleDeleteConfirm}
        okText="Delete"
        cancelText="Cancel"
        closable={false}
        centered
      >
        <p>Deleting this record will remove it permanently. Are you sure?</p>
      </Modal>
    </div>
  );
};

export default Record;
