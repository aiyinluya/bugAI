import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Avatar, Modal, Space, Tooltip, Statistic, Divider, Select, Input, Form, message } from 'antd';
import { EyeOutlined, HeartTwoTone, HeartFilled, FileTextOutlined, FireOutlined, BookOutlined, SearchOutlined, CommentOutlined } from '@ant-design/icons';
import { ErrorCase, AIProvider, ErrorType, Comment } from '../types/case';
import { useCaseStore } from '../store/caseStore';
import { useUserStore } from '../store/userStore';
import WhippingScene from './WhippingScene';

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

interface CaseDisplayProps {
  cases?: ErrorCase[];
}

const CaseDisplay: React.FC<CaseDisplayProps> = ({ cases: propCases }) => {
  const [selectedCase, setSelectedCase] = useState<ErrorCase | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterProvider, setFilterProvider] = useState<AIProvider | 'all'>('all');
  const [filterErrorType, setFilterErrorType] = useState<ErrorType | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [form] = Form.useForm();
  
  // 从store获取案例数据
  const { 
    cases: storeCases, 
    incrementWhipCount, 
    incrementViewCount, 
    voteAngry, 
    voteLearn,
    fetchComments,
    createComment,
    toggleLike,
    isLiked,
    getLikeCount,
    shareCase,
    comments
  } = useCaseStore();
  
  // 获取当前登录用户（暂时移除，使用匿名用户）
  // const { user } = useUserStore();
  
  const displayCases = propCases || storeCases;
  
  // 过滤案例
  const filteredCases = displayCases.filter(caseItem => {
    const matchesProvider = filterProvider === 'all' || caseItem.aiProvider === filterProvider;
    const matchesErrorType = filterErrorType === 'all' || caseItem.errorType === filterErrorType;
    const matchesSearch = caseItem.aiName.includes(searchText) || 
                         caseItem.originalDialog.some(msg => msg.content.includes(searchText)) ||
                         caseItem.highlightedText.includes(searchText);
    
    return matchesProvider && matchesErrorType && matchesSearch;
  });
  
  // 打开案例详情
  const openCaseDetail = async (caseItem: ErrorCase) => {
    setSelectedCase(caseItem);
    setModalVisible(true);
    incrementViewCount(caseItem.id);
    
    // 加载评论
    try {
      await fetchComments(caseItem.id);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('加载评论失败');
    }
  };
  
  // 鞭打AI
  const handleWhipAI = () => {
    if (selectedCase) {
      incrementWhipCount(selectedCase.id);
      // 这里可以添加更多鞭打逻辑，比如触发3D效果
    }
  };
  
  // 提交评论
  const handleSubmitComment = async () => {
    if (!selectedCase) {
      message.error('请先选择一个案例');
      return;
    }
    
    if (!commentContent.trim()) {
      message.error('评论内容不能为空');
      return;
    }
    
    try {
      // 使用匿名用户ID提交评论
      await createComment(selectedCase.id, 'anonymous-user', commentContent.trim());
      message.success('评论成功');
      setCommentContent('');
      form.resetFields();
    } catch (error) {
      console.error('Failed to create comment:', error);
      message.error('评论失败');
    }
  };
  
  // 处理点赞
  const handleLike = async () => {
    if (!selectedCase) {
      message.error('请先选择一个案例');
      return;
    }
    
    try {
      // 使用匿名用户ID提交点赞
      const isNowLiked = await toggleLike(selectedCase.id, 'anonymous-user');
      message.success(isNowLiked ? '点赞成功' : '取消点赞成功');
    } catch (error) {
      console.error('Failed to toggle like:', error);
      message.error('点赞操作失败');
    }
  };
  
  // 根据屏幕宽度确定列数
  const getColumns = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 4;
    if (width >= 992) return 3;
    if (width >= 768) return 2;
    return 1;
  };
  
  return (
    <div className="case-display-container">
      <div className="case-display-content">
        {/* 筛选栏 */}
        <Card size="small" className="case-filter-card mb-4">
          <div className="case-filter-content">
            <Search
              placeholder="搜索AI名称、对话内容或错误描述"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 400, marginBottom: 16 }}
            />
            
            <div className="case-filter-selects">
              <Select
                value={filterProvider}
                onChange={setFilterProvider}
                style={{ width: 180, marginRight: 16 }}
                placeholder="选择AI提供商"
                size="middle"
              >
                <Option value="all">全部提供商</Option>
                <Option value="ChatGPT">ChatGPT</Option>
                <Option value="Claude">Claude</Option>
                <Option value="文心一言">文心一言</Option>
                <Option value="通义千问">通义千问</Option>
                <Option value="自定义">自定义</Option>
                <Option value="未知">未知</Option>
              </Select>
              
              <Select
                value={filterErrorType}
                onChange={setFilterErrorType}
                style={{ width: 180 }}
                placeholder="选择错误类型"
                size="middle"
              >
                <Option value="all">全部错误类型</Option>
                <Option value="事实错误">事实错误</Option>
                <Option value="逻辑混乱">逻辑混乱</Option>
                <Option value="答非所问">答非所问</Option>
                <Option value="循环重复">循环重复</Option>
                <Option value="敷衍应付">敷衍应付</Option>
              </Select>
            </div>
          </div>
        </Card>
        
        {/* 案例列表 */}
        <Row
          gutter={[16, 16]}
        >
          {filteredCases.map(caseItem => (
            <Col key={caseItem.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <div className="case-card-cover">
                    <div className="case-card-tags">
                      <Tag color={getProviderColor(caseItem.aiProvider)}>
                        {caseItem.aiProvider}
                      </Tag>
                      <Tag color={getErrorTypeColor(caseItem.errorType)}>
                        {caseItem.errorType}
                      </Tag>
                    </div>
                    <h4 className="case-card-title">{caseItem.aiName}</h4>
                    <p className="case-card-desc">
                      {caseItem.highlightedText}
                    </p>
                  </div>
                }
                actions={[
                  <Tooltip title="查看详情">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => openCaseDetail(caseItem)}
                    />
                  </Tooltip>,
                  <Tooltip title="鞭打次数">
                    <Button type="text" icon={<FireOutlined />}>
                      {caseItem.whipCount}
                    </Button>
                  </Tooltip>,
                  <Tooltip title="愤怒投票">
                    <Button type="text" icon={<HeartTwoTone twoToneColor="#ff4d4f" />}>
                      {caseItem.voteAngry}
                    </Button>
                  </Tooltip>,
                  <Tooltip title="学习投票">
                    <Button type="text" icon={<BookOutlined />}>
                      {caseItem.voteLearn}
                    </Button>
                  </Tooltip>,
                  <Tooltip title="查看次数">
                    <Button type="text" icon={<EyeOutlined />}>
                      {caseItem.views}
                    </Button>
                  </Tooltip>,
                  <Tooltip title="点赞数">
                    <Button type="text" icon={<HeartTwoTone />}>
                      {getLikeCount(caseItem.id)}
                    </Button>
                  </Tooltip>,
                  <Tooltip title="评论数">
                    <Button type="text" icon={<CommentOutlined />}>
                      {caseItem.comments?.length || 0}
                    </Button>
                  </Tooltip>
                ]}
              >
                <Card.Meta
                  avatar={<Avatar icon={<FileTextOutlined />} />}
                  title={caseItem.aiName}
                  description={
                    <div className="case-card-meta">
                      <span className="case-card-date">
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </span>
                      <Statistic
                        value={caseItem.whipCount}
                        prefix={<FireOutlined />}
                        valueStyle={{ color: '#ff7875' }}
                        style={{ margin: 0 }}
                      />
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
        
        {/* 案例详情模态框 */}
        <Modal
          title="AI错误案例详情"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedCase && (
            <div className="case-detail-container">
              {/* 案例头部信息 */}
              <div className="case-detail-header">
                <div>
                  <h3 className="case-detail-title">{selectedCase.aiName}</h3>
                  <div className="case-detail-tags">
                    <Tag color={getProviderColor(selectedCase.aiProvider)}>
                      {selectedCase.aiProvider}
                    </Tag>
                    <Tag color={getErrorTypeColor(selectedCase.errorType)}>
                      {selectedCase.errorType}
                    </Tag>
                  </div>
                </div>
                <div className="case-detail-date">
                  <p>
                    提交时间：{new Date(selectedCase.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* 统计信息 */}
              <div className="case-detail-stats">
                <div className="case-detail-stat-item">
                  <Statistic
                    title="查看次数"
                    value={selectedCase.views}
                    prefix={<EyeOutlined />}
                  />
                </div>
                <div className="case-detail-stat-item">
                  <Statistic
                    title="鞭打次数"
                    value={selectedCase.whipCount}
                    prefix={<FireOutlined />}
                    valueStyle={{ color: '#ff7875' }}
                  />
                </div>
                <div className="case-detail-stat-item">
                  <Statistic
                    title="愤怒投票"
                    value={selectedCase.voteAngry}
                    prefix={<HeartTwoTone />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </div>
                <div className="case-detail-stat-item">
                  <Statistic
                    title="学习投票"
                    value={selectedCase.voteLearn}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </div>
                <div className="case-detail-stat-item">
                  <Statistic
                    title="点赞数"
                    value={getLikeCount(selectedCase.id)}
                    prefix={<HeartTwoTone />}
                    valueStyle={{ color: '#ff7875' }}
                  />
                </div>
                <div className="case-detail-stat-item">
                  <Statistic
                    title="评论数"
                    value={selectedCase.comments?.length || 0}
                    prefix={<CommentOutlined />}
                  />
                </div>
              </div>
              
              <Divider />
              
              {/* 对话记录 */}
              <div className="case-detail-section">
                <h4 className="case-detail-section-title">
                  <FileTextOutlined /> 对话记录
                </h4>
                <div className="case-detail-dialog">
                  {selectedCase.originalDialog.map((message, index) => (
                    <div
                      key={index}
                      className={`case-detail-message ${message.role === 'user' ? 'case-detail-message-user' : 'case-detail-message-ai'}`}
                    >
                      <div className="case-detail-message-content">
                        <Avatar
                          style={{ backgroundColor: message.role === 'user' ? '#1890ff' : '#8c8c8c' }}
                        >
                          {message.role === 'user' ? 'U' : 'A'}
                        </Avatar>
                        <div className="case-detail-message-text">
                          <p className="case-detail-message-role">
                            {message.role === 'user' ? '用户' : 'AI'}
                          </p>
                          <p className="case-detail-message-content-text">{message.content}</p>
                          <p className="case-detail-message-time">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Divider />
              
              {/* 错误分析 */}
              <div className="case-detail-section">
                <h4 className="case-detail-section-title">
                  <FireOutlined /> 错误分析
                </h4>
                <Card size="small" bordered={false} className="case-detail-error-card">
                  <p>{selectedCase.highlightedText}</p>
                </Card>
              </div>
              
              {/* 修正建议 */}
              <div className="case-detail-section">
                <h4 className="case-detail-section-title">
                  <BookOutlined /> 修正建议
                </h4>
                <Card size="small" bordered={false} className="case-detail-suggestion-card">
                  <p>{selectedCase.correctionSuggest || '暂无修正建议'}</p>
                </Card>
              </div>
              
              <Divider />
              
              {/* 操作按钮 */}
              <div className="case-detail-actions">
                <Space size="middle">
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<FireOutlined />}
                    onClick={handleWhipAI}
                  >
                    鞭打AI
                  </Button>
                  <Button
                    type={isLiked(selectedCase.id, 'anonymous-user') ? 'primary' : 'default'}
                    size="large"
                    icon={isLiked(selectedCase.id, 'anonymous-user') ? <HeartFilled /> : <HeartTwoTone />}
                    onClick={handleLike}
                  >
                    {isLiked(selectedCase.id, 'anonymous-user') ? '已点赞' : '点赞'} ({getLikeCount(selectedCase.id)})
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    icon={<HeartTwoTone twoToneColor="#ff4d4f" />}
                    onClick={() => voteAngry(selectedCase.id)}
                  >
                    愤怒 ({selectedCase.voteAngry})
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    icon={<BookOutlined />}
                    onClick={() => voteLearn(selectedCase.id)}
                  >
                    学习 ({selectedCase.voteLearn})
                  </Button>
                  <Button
                    type={isLiked(selectedCase.id, 'anonymous-user') ? 'primary' : 'default'}
                    size="large"
                    icon={isLiked(selectedCase.id, 'anonymous-user') ? <HeartFilled /> : <HeartTwoTone />}
                    onClick={handleLike}
                  >
                    {isLiked(selectedCase.id, 'anonymous-user') ? '已点赞' : '点赞'} ({getLikeCount(selectedCase.id)})
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    icon={<FileTextOutlined />}
                    onClick={() => shareCase(selectedCase.id)}
                  >
                    分享
                  </Button>
                </Space>
              </div>
              
              {/* 3D鞭打场景 */}
              <div className="case-detail-whipping">
                <WhippingScene />
              </div>
              
              <Divider />
              
              {/* 评论区 */}
              <div className="case-detail-comments">
                <h4 className="case-detail-section-title">
                  <CommentOutlined /> 评论 ({comments.length})
                </h4>
                
                {/* 评论输入框 */}
                <div className="case-detail-comment-input">
                  <Form form={form} layout="vertical">
                    <Form.Item
                      name="content"
                      rules={[{ required: true, message: '评论内容不能为空' }]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="请输入评论内容..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        style={{ resize: 'vertical', marginBottom: 8 }}
                      />
                    </Form.Item>
                    <div className="case-detail-comment-actions">
                      <Button
                        type="primary"
                        onClick={handleSubmitComment}
                        // 移除用户登录检查，只检查评论内容是否为空
                        disabled={!commentContent.trim()}
                      >
                        提交评论
                      </Button>
                    </div>
                  </Form>
                </div>
                
                {/* 评论列表 */}
                <div className="case-detail-comment-list">
                  {comments.length === 0 ? (
                    <div className="case-detail-no-comments">
                      <p>暂无评论，快来发表你的看法吧！</p>
                    </div>
                  ) : (
                    comments.map((comment: Comment) => (
                      <div key={comment.id} className="case-detail-comment-item">
                        <div className="case-detail-comment-avatar">
                          <Avatar
                            src={comment.user?.avatar}
                            alt={comment.user?.username || '用户'}
                          >
                            {comment.user?.username?.charAt(0) || 'U'}
                          </Avatar>
                        </div>
                        <div className="case-detail-comment-content">
                          <div className="case-detail-comment-header">
                            <span className="case-detail-comment-username">
                              {comment.user?.username || '匿名用户'}
                            </span>
                            <span className="case-detail-comment-time">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="case-detail-comment-text">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

// 根据AI提供商获取颜色
const getProviderColor = (provider: AIProvider): string => {
  const colorMap: Record<AIProvider, string> = {
    'ChatGPT': '#10a37f',
    'Claude': '#0085ff',
    '文心一言': '#eb2f96',
    '通义千问': '#faad14',
    '自定义': '#52c41a',
    '未知': '#8c8c8c'
  };
  return colorMap[provider];
};

// 根据错误类型获取颜色
const getErrorTypeColor = (errorType: ErrorType): string => {
  const colorMap: Record<ErrorType, string> = {
    '事实错误': '#ff4d4f',
    '逻辑混乱': '#faad14',
    '答非所问': '#1890ff',
    '循环重复': '#722ed1',
    '敷衍应付': '#fa8c16'
  };
  return colorMap[errorType];
};

export default CaseDisplay;