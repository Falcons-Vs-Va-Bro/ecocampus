import { Button, Result } from 'antd'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page-panel p-6">
      <Result
        status="404"
        title="页面不存在"
        subTitle="当前路由未纳入 EcoCampus 前端路由契约。"
        extra={
          <Button type="primary">
            <Link to="/">返回首页</Link>
          </Button>
        }
      />
    </div>
  )
}
