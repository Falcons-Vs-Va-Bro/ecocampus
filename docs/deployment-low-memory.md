# 低内存 Linux 部署

目标环境为系统仅剩约 1GB 可用内存。生产环境不运行 Vite、pnpm 或 Node 服务：前端构建为静态文件交给 Nginx，后端以单个 Spring Boot JAR 运行。

## 内存预算

- Spring Boot：`-Xms128m -Xmx384m -XX:MaxMetaspaceSize=192m -XX:+UseSerialGC`，进程 RSS 通常应控制在约 500–650MB 内。
- Nginx：通常低于 30MB。
- 系统与监控预留：至少 150MB。
- MySQL 优先使用外部实例。如果必须同机，需把 InnoDB buffer pool 控制在 128–192MB、连接数控制在 30 以内，并配置 1–2GB swap；同机方案余量很小。
- Redis 当前没有业务代码使用，生产依赖已移除，不部署 Redis。

## 构建

```bash
cd frontend
VITE_USE_MOCKS=false VITE_API_BASE_URL=/api/v1 pnpm install --frozen-lockfile
pnpm build

cd ../backend
./mvnw clean package
```

将 `frontend/dist/` 内容复制到 `/opt/ecocampus/frontend/`，将后端 JAR 复制为 `/opt/ecocampus/ecocampus.jar`，并创建 `/opt/ecocampus/storage/uploads/`。

## 配置与启动

1. 将 `deploy/ecocampus.env.example` 复制到 `/etc/ecocampus/ecocampus.env`，权限设为 `600`，填入真实数据库密码和至少 32 字节的随机 JWT 密钥。
2. 安装 `deploy/ecocampus.service` 到 `/etc/systemd/system/`。
3. 安装 `deploy/nginx.conf` 为站点配置。
4. 执行 `systemctl daemon-reload && systemctl enable --now ecocampus nginx`。
5. 检查 `curl http://127.0.0.1:8080/actuator/health` 和站点 `/api/v1/health`。

数据库结构只通过 Flyway 迁移，生产 profile 会拒绝 H2、空数据库凭据、关闭 Flyway或不安全的 Hibernate DDL 配置。
