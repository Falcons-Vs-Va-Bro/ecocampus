# 低内存 Linux 部署

推荐使用双机部署：本机作为 runner 和应用主机，`dmit-la` 作为带公网 IP 的边缘入口。生产环境不运行 Vite、pnpm 或 Node 服务：前端构建为静态文件部署到 `dmit-la` 的 Nginx，`/api` 和 `/uploads` 通过既有 Tailscale 内网反代到本机 Spring Boot。

```text
Internet -> dmit-la:443 (Nginx + frontend/dist)
                    -> Tailscale -> ecocampus-runner:8080 (Spring Boot)
                                           -> 127.0.0.1:3306 (MySQL)
```

## 内存预算

- Spring Boot：`-Xms128m -Xmx384m -XX:MaxMetaspaceSize=192m -XX:+UseSerialGC`，进程 RSS 通常应控制在约 500–650MB 内。
- `dmit-la` Nginx：通常低于 30MB，只保存静态前端并代理动态请求。
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

将 `frontend/dist/` 内容同步到 `dmit-la:/opt/ecocampus/frontend/`。在本机将后端 JAR 复制为 `/opt/ecocampus/ecocampus.jar`，并创建 `/opt/ecocampus/storage/uploads/`。

## 配置与启动

1. 本机：将 `deploy/ecocampus.env.example` 复制到 `/etc/ecocampus/ecocampus.env`，权限设为 `600`，填入数据库密码、至少 32 字节的随机 JWT 密钥，以及本机 Tailscale IPv4 `SERVER_ADDRESS`。
2. 本机：安装 `deploy/ecocampus.service` 到 `/etc/systemd/system/`，启动 `ecocampus`；MySQL 只监听 `127.0.0.1`。
3. `dmit-la`：安装 `deploy/nginx.conf`，把 `ecocampus-runner` 替换为本机 MagicDNS 名称或 Tailscale IPv4，配置公网域名证书，只开放公网 80/443。
4. Tailscale Grants 仅允许 `dmit-la` 访问本机 TCP 8080。本机防火墙只允许 `tailscale0` 上来自 `dmit-la` Tailscale IP 的 8080，禁止公网接口访问该端口。
5. 在 `dmit-la` 执行 `curl http://ecocampus-runner:8080/actuator/health`，再检查公网 `https://域名/api/v1/health`。

建议在两台机器为 Tailscale 节点使用稳定 tag，并在 tailnet policy 中加入类似规则（具体 tag 名按现有策略调整）：

```json
{
  "grants": [
    { "src": ["tag:ecocampus-edge"], "dst": ["tag:ecocampus-app"], "ip": ["tcp:8080"] }
  ]
}
```

不要通过公网安全组开放本机 8080、3306，也不要让 `dmit-la` 访问 3306。

数据库结构只通过 Flyway 迁移，生产 profile 会拒绝 H2、空数据库凭据、关闭 Flyway或不安全的 Hibernate DDL 配置。
