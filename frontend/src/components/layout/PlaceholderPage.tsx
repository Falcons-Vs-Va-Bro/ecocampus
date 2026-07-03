import { Badge, Card, Col, Row, Space, Tag, Typography } from 'antd'
import { ArrowRight, FileJson2, LockKeyhole, Route } from 'lucide-react'
import type { RouteMeta } from '../../types/routes'
import { FadeIn } from '../motion/FadeIn'

interface PlaceholderPageProps {
  meta: RouteMeta
}

const moduleLabel = {
  public: '前台公开',
  user: '用户中心',
  admin: '后台管理',
}

const moduleColor = {
  public: 'green',
  user: 'blue',
  admin: 'volcano',
}

export function PlaceholderPage({ meta }: PlaceholderPageProps) {
  return (
    <FadeIn className="page-panel p-5 md:p-7">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Space wrap>
            <span className="route-chip">
              <Route size={14} className="mr-2" />
              {meta.path}
            </span>
            <Tag color={moduleColor[meta.module]}>{moduleLabel[meta.module]}</Tag>
            <Tag icon={<LockKeyhole size={13} />} color={meta.guard === 'public' ? 'success' : 'processing'}>
              {meta.permission}
            </Tag>
          </Space>
          <div>
            <Typography.Title level={1} style={{ margin: 0, color: '#10251c' }}>
              {meta.title}
            </Typography.Title>
            <Typography.Paragraph className="mt-3 max-w-[760px] text-[15px] leading-7 text-[#53645c]">
              {meta.description}
            </Typography.Paragraph>
          </div>
        </div>
        <Badge status="processing" text="骨架页，可访问" className="font-semibold text-[#53645c]" />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <FileJson2 size={18} />
                对应接口清单
              </span>
            }
            variant="borderless"
            className="h-full"
          >
            <div className="grid gap-2">
              {meta.endpoints.map((endpoint) => (
                <div className="endpoint-row" key={endpoint}>
                  <ArrowRight size={14} className="shrink-0 text-[#07935f]" />
                  <span>{endpoint}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card title="后续接入点" variant="borderless" className="h-full">
            <ul className="m-0 space-y-3 pl-4 text-[14px] leading-6 text-[#4c5e55]">
              <li>页面 UI 可在当前路由下按业务模块拆分到 `features/`。</li>
              <li>查询和 mutation 使用 TanStack Query 管理缓存失效。</li>
              <li>表单使用 React Hook Form + Zod 对齐接口 DTO。</li>
              <li>后端权限以 RBAC 文档和 Service 层资源归属判断为准。</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </FadeIn>
  )
}
