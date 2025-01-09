import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Upload,
  Row,
  Col,
  message,
  Select,
  DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const api_uri = "https://insurance-agenta-server.onrender.com/api/";

const AddRecord = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await axios.get(`${api_uri}companies`);
        setCompanies(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      } catch (error) {
        console.error("Error fetching companies:", error);
        message.error("Failed to load companies.");
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (values) => {
    try {
      // Append fields to FormData
      const payload = {
        vehicleNumber: values.vehicleNumber,
        vehicleName: values.vehicleName,
        policy: values.policy,
        ownerName: values.ownerName,
        insuranceDate: values.insuranceDate.toISOString(), // Convert to ISO string
        expiryDate: values.expiryDate.toISOString(), // Convert to ISO string
        insType: values.insType,
        insPrice: values.insPrice,
        company: values.company,
      };

      setIsSubmitting(true);

      const response = await axios.post(`${api_uri}records`, payload);

      message.success("Record added successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error adding record:", error);
      message.error("Failed to add record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-slate-900 p-4 font-medium pb-10">
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <h1 className="font-bold text-2xl text-gray-800">Add Record</h1>
        <div className="flex gap-3 flex-wrap">
          <Button
            type="primary"
            size="medium"
            icon={<PlusOutlined />}
            onClick={() => form.submit()}
            loading={isSubmitting}
          >
            Add
          </Button>
          <Button size="medium" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 16]}>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Vehicle Number"
                  name="vehicleNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the vehicle number!",
                    },
                  ]}
                >
                  <Input placeholder="Enter vehicle number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Vehicle Name"
                  name="vehicleName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the vehicle name!",
                    },
                  ]}
                >
                  <Input placeholder="Enter vehicle name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Policy"
                  name="policy"
                  rules={[
                    { required: true, message: "Please enter the policy!" },
                  ]}
                >
                  <Input placeholder="Enter policy details" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Owner Name"
                  name="ownerName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the owner's name!",
                    },
                  ]}
                >
                  <Input placeholder="Enter owner's name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Insurance Date"
                  name="insuranceDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select the insurance date!",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Expiry Date"
                  name="expiryDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select the expiry date!",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Insurance Type"
                  name="insType"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the insurance type!",
                    },
                  ]}
                >
                  <Input placeholder="Enter insurance type" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Insurance Price" name="insPrice">
                  <Input type="number" placeholder="Enter price" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Company"
                  name="company"
                  rules={[
                    { required: true, message: "Please select a company!" },
                  ]}
                >
                  <Select
                    placeholder="Select a company"
                    loading={loadingCompanies}
                    allowClear
                  >
                    {companies.map((company) => (
                      <Select.Option key={company._id} value={company._id}>
                        {company.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Row>
      </Form>
    </div>
  );
};

export default AddRecord;
