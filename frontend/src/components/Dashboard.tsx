import React, { useEffect } from 'react';
import { Card, Row, Col, Spin } from 'antd';
import { Pie, Column } from '@ant-design/charts';
import { useCaseStore } from '../store/caseStore';

const Dashboard: React.FC = () => {
  const { statistics, getStatistics, loading } = useCaseStore();

  useEffect(() => {
    // 加载统计数据
    getStatistics();
  }, [getStatistics]);

  if (loading || !statistics) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 饼图配置 - 按AI提供商
  const pieConfig = {
    data: statistics.casesByProvider,
    angleField: 'count',
    colorField: 'aiProvider',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };

  // 柱状图配置 - 按错误类型
  const columnConfig = {
    data: statistics.casesByErrorType,
    xField: 'errorType',
    yField: 'count',
    label: {
      position: 'top',
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        {/* 总案例数统计卡片 */}
        <Col span={12}>
          <Card title="总案例数" bordered={false}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center' }}>
              {statistics.totalCases}
            </div>
          </Card>
        </Col>

        {/* 总鞭打数统计卡片 */}
        <Col span={12}>
          <Card title="总鞭打数" bordered={false}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center' }}>
              {statistics.totalWhipCount}
            </div>
          </Card>
        </Col>

        {/* 按AI提供商统计饼图 */}
        <Col span={12}>
          <Card title="按AI提供商统计" bordered={false}>
            <div style={{ height: '400px' }}>
              <Pie {...pieConfig} />
            </div>
          </Card>
        </Col>

        {/* 按错误类型统计柱状图 */}
        <Col span={12}>
          <Card title="按错误类型统计" bordered={false}>
            <div style={{ height: '400px' }}>
              <Column {...columnConfig} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;