import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Space,
  Table,
  Typography,
  Modal,
  Tag,
  message,
  Form,
  Select,
  Row,
  Dropdown,
  Menu,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Title } = Typography;

const api_uri = "https://insurance-agenta-server.onrender.com/api/companies";

const Company = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${api_uri}`);
      const companiesWithKeys = response.data.data.map((company, index) => ({
        ...company,
        key: company._id,
        cno: `${(index + 1).toString().padStart(3, "0")}`,
      }));
      setData(companiesWithKeys);
      setFilteredData(companiesWithKeys);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch companies");
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "C.No",
      dataIndex: "cno",
      key: "cno",
      width: 100,
      sorter: (a, b) => a.cno.localeCompare(b.cno),
      render: (text) => <span style={{ fontWeight: 400 }}>{text}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Agent Name",
      dataIndex: "agentName",
      key: "agentName",
      render: (text) => <span>{text || "-"}</span>,
    },
    {
      title: "Licence",
      dataIndex: "licence",
      key: "licence",
      render: (text) => <span>{text || "-"}</span>,
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddCompany = async (values) => {
    try {
      await axios.post(api_uri, {
        name: values.name,
        agentName: values.agentName,
        licence: values.licence,
      });
      setIsAddModalOpen(false);
      fetchCompanies();
      message.success("Company added successfully");
    } catch (error) {
      console.error("Add error:", error);
      message.error("Failed to add company");
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    const filteredResults = data.filter(
      (item) =>
        item.cno.toLowerCase().includes(value) ||
        item.name?.toLowerCase().includes(value) ||
        item.agentName?.toLowerCase().includes(value) ||
        item.licence?.toLowerCase().includes(value)
    );
    setFilteredData(filteredResults);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
    form.setFieldsValue({
      name: record.name,
      agentName: record.agentName,
      licence: record.licence,
      records: record.records.map((rec) => rec._id),
    });
  };

  const handleSaveEdit = async (values) => {
    try {
      await axios.put(`${api_uri}/${selectedRecord._id}`, {
        name: values.name,
        agentName: values.agentName,
        licence: values.licence,
        records: values.records,
      });
      setIsEditModalOpen(false);
      fetchCompanies();
      message.success("Company updated successfully");
    } catch (error) {
      console.error("Edit error:", error);
      message.error("Failed to update company");
    }
  };

  const handleDelete = (record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord || !selectedRecord._id) {
      message.error("Company not found");
      return;
    }

    try {
      await axios.delete(`${api_uri}/${selectedRecord._id}`);
      await fetchCompanies();
      setIsDeleteModalOpen(false);
      message.success("Company deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete company");
    }
  };

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
          Company
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
            onClick={() => setIsAddModalOpen(true)}
          />
        </Space>
      </Space>

      <Modal
        title="Add Company"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => form.submit()}>
            Save
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCompany}
          initialValues={{
            name: "",
            agentName: "",
            licence: "",
          }}
        >
          <Form.Item
            label="Company Name"
            name="name"
            rules={[
              { required: true, message: "Please input the company name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Agent Name" name="agentName">
            <Input />
          </Form.Item>
          <Form.Item label="Licence" name="licence">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Input
        placeholder="Search companies..."
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
        responsive={{ xs: 1, sm: 2, md: 3, lg: 4 }}
      />

      {/* View Company Modal */}
      <Modal
        title={`Company: ${selectedRecord?.name}`}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(selectedRecord)}
          />,
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(selectedRecord)}
          />
        ]}
        width={800}
      >
        <p className=" text-slate-800 font-semibold text-xl py-2">
          <b className=" text-gray-700 font-medium text-base">Agent Name:</b>{" "}
          {selectedRecord?.agentName || "No agent name available"}
        </p>
        <p className=" text-slate-800 font-semibold text-xl py-2">
          <b className=" text-gray-700 font-medium text-base">Licence:</b>{" "}
          {selectedRecord?.licence || "No licence available"}
        </p>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        title="Edit Company"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => form.submit()}>
            Save
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveEdit}
          initialValues={{
            name: selectedRecord?.name,
            agentName: selectedRecord?.agentName,
            licence: selectedRecord?.licence,
          }}
        >
          <Form.Item
            label="Company Name"
            name="name"
            rules={[
              { required: true, message: "Please input the company name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Agent Name" name="agentName">
            <Input />
          </Form.Item>
          <Form.Item label="Licence" name="licence">
            <Input />
          </Form.Item>
          <Form.Item label="Records" name="records">
            <Select
              mode="multiple"
              allowClear
              placeholder="Select records"
              options={records.map((record) => ({
                value: record._id,
                label: record.name,
              }))}
              defaultValue={selectedRecord?.records.map((record) => record._id)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Company Modal */}
      <Modal
        title="Are you sure you want to delete this company?"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleDeleteConfirm}
        okText="Delete"
        cancelText="Cancel"
        centered
      >
        <p>Deleting this company will remove it permanently. Are you sure?</p>
      </Modal>
    </div>
  );
};

export default Company;
