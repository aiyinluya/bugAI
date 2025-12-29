import React, { useState } from 'react';
import { Form, Input, Select, Button, message, Space, Divider } from 'antd';
import type { CaseFormData, DialogMessage, AIProvider, ErrorType } from '../types/case';
import { useCaseStore } from '../store/caseStore';
import { useUserStore } from '../store/userStore';

const { TextArea } = Input;

interface CaseSubmitFormProps {
  onSuccess?: () => void;
}

const CaseSubmitForm: React.FC<CaseSubmitFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm<CaseFormData>();
  const [userMessage, setUserMessage] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [dialogHistory, setDialogHistory] = useState<DialogMessage[]>([]);
  
  const { submitCase } = useCaseStore();
  const { user } = useUserStore();
  
  // 添加对话记录
  const addDialog = () => {
    if (!userMessage.trim() || !aiMessage.trim()) {
      message.warning('请完整输入用户和AI的对话内容');
      return;
    }
    
    const newDialog: DialogMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage.trim(),
      timestamp: Date.now()
    };
    
    const newAiDialog: DialogMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiMessage.trim(),
      timestamp: Date.now() + 1000
    };
    
    setDialogHistory([...dialogHistory, newDialog, newAiDialog]);
    setUserMessage('');
    setAiMessage('');
  };
  
  // 删除对话记录
  const removeDialog = (id: string) => {
    setDialogHistory(dialogHistory.filter(msg => msg.id !== id));
  };
  
  // 提交表单
  const handleSubmit = async (values: CaseFormData) => {
    if (dialogHistory.length === 0) {
      message.error('请添加至少一条对话记录');
      return;
    }
    
    try {
      // 不再检查用户登录状态
      await submitCase('anonymous-user', {
        ...values,
        dialogMessages: dialogHistory
      });
      message.success('案例提交成功！');
      form.resetFields();
      setDialogHistory([]);
      // 调用onSuccess回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error('案例提交失败，请稍后重试');
      console.error('提交失败:', error);
    }
  };
  
  return (
    <div className="case-submit-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="form-container"
      >
        <Form.Item
          name="aiName"
          label="AI名称"
          rules={[{ required: true, message: '请输入AI名称' }]}
        >
          <Input placeholder="例如：ChatGPT 4.0" />
        </Form.Item>
        
        <Form.Item
          name="aiProvider"
          label="AI提供商"
          rules={[{ required: true, message: '请选择AI提供商' }]}
        >
          <Select placeholder="请选择AI提供商">
            <Select.Option value="ChatGPT">ChatGPT</Select.Option>
            <Select.Option value="Claude">Claude</Select.Option>
            <Select.Option value="文心一言">文心一言</Select.Option>
            <Select.Option value="通义千问">通义千问</Select.Option>
            <Select.Option value="自定义">自定义</Select.Option>
            <Select.Option value="未知">未知</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="errorType"
          label="错误类型"
          rules={[{ required: true, message: '请选择错误类型' }]}
        >
          <Select placeholder="请选择错误类型">
            <Select.Option value="事实错误">事实错误</Select.Option>
            <Select.Option value="逻辑混乱">逻辑混乱</Select.Option>
            <Select.Option value="答非所问">答非所问</Select.Option>
            <Select.Option value="循环重复">循环重复</Select.Option>
            <Select.Option value="敷衍应付">敷衍应付</Select.Option>
          </Select>
        </Form.Item>
        
        <Divider orientation="left">对话记录</Divider>
        
        <div className="dialog-input-section">
          <Form.Item label="用户输入">
            <TextArea
              rows={3}
              placeholder="请输入用户的问题或对话内容"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
          </Form.Item>
          
          <Form.Item label="AI回复">
            <TextArea
              rows={3}
              placeholder="请输入AI的错误回复内容"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" onClick={addDialog} block>
              添加对话记录
            </Button>
          </Form.Item>
        </div>
        
        {dialogHistory.length > 0 && (
          <div className="dialog-history-section">
            <h4>已添加的对话记录:</h4>
            {dialogHistory.map((msg) => (
              <div key={msg.id} className="dialog-item">
                <div className={`dialog-role ${msg.role}`}>
                  {msg.role === 'user' ? '用户' : 'AI'}
                </div>
                <div className="dialog-content">{msg.content}</div>
                <Button 
                  type="text" 
                  danger 
                  onClick={() => removeDialog(msg.id)}
                  size="small"
                >
                  删除
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <Divider orientation="left">错误详情</Divider>
        
        <Form.Item
          name="highlightedText"
          label="错误内容"
          rules={[{ required: true, message: '请描述AI的错误内容' }]}
        >
          <TextArea
            rows={4}
            placeholder="请详细描述AI回答中的错误内容"
          />
        </Form.Item>
        
        <Form.Item
          name="correctionSuggest"
          label="修正建议"
          rules={[{ required: true, message: '请提供正确的回答建议' }]}
        >
          <TextArea
            rows={4}
            placeholder="请提供正确的回答建议或解释"
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" size="large">
              提交案例
            </Button>
            <Button size="large" onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CaseSubmitForm;