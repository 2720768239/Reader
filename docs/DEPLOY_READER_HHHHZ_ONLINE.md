# Reader 自动部署到 `reader.hhhhz.online`

本文档对应当前确定方案：

- 域名：`reader.hhhhz.online`
- Nginx 站点根目录：`/var/www/reader`
- 构建位置：GitHub Actions
- 服务器职责：只接收 `dist` 并由 Nginx 提供静态文件

---

## 1. 方案概览

发布链路如下：

1. 本地提交代码并 push 到 GitHub `main`
2. GitHub Actions 执行 `npm ci`、`npm run typecheck`、`npm test`、`npm run build`
3. Actions 将构建产物 `dist/` 打包为 `reader-dist.tar.gz`
4. Actions 通过 SSH 上传压缩包到阿里云 `/tmp/reader-dist.tar.gz`
5. 服务器解压并使用 `rsync --delete` 同步到 `/var/www/reader`
6. Nginx 直接提供 `/var/www/reader` 下的静态文件

这样做的原因：

- `Reader` 是 Vite 静态站点，不需要在服务器常驻 Node 服务
- 你的 ECS 内存较小，避免服务器本机构建更稳
- 不新增 Docker 容器和额外端口，复用现有 Nginx 入口

---

## 2. GitHub 仓库配置

工作流文件：[`/.github/workflows/deploy.yml`](/E:/cwh/project/Reader/.github/workflows/deploy.yml)

需要在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 中新增以下 secrets：

- `ALIYUN_HOST`
- `ALIYUN_PORT`
- `ALIYUN_USER`
- `ALIYUN_SSH_KEY`

建议值示例：

- `ALIYUN_HOST`: 你的 ECS 公网 IP 或绑定到 SSH 的主机名
- `ALIYUN_PORT`: `22`
- `ALIYUN_USER`: 你的服务器登录用户，例如 `root` 或 `admin`
- `ALIYUN_SSH_KEY`: 与服务器 `authorized_keys` 配对的私钥全文

说明：

- 工作流在 `push main` 和手动 `workflow_dispatch` 时触发
- 若默认发布分支不是 `main`，修改工作流里的分支名

---

## 3. 服务器准备

### 3.1 创建站点目录

```bash
sudo mkdir -p /var/www/reader
sudo chown -R $USER:$USER /var/www/reader
```

如果 GitHub Actions 使用 `root` 登录服务器，这一步可以省略 `chown`。

### 3.2 确认 rsync 可用

工作流依赖服务器上的 `rsync`：

```bash
sudo apt update
sudo apt install -y rsync
```

### 3.3 配置 GitHub Actions 使用的 SSH 公钥

在本地生成一对部署专用密钥：

```bash
ssh-keygen -t ed25519 -C "github-actions-reader-deploy"
```

把公钥追加到服务器用户的 `~/.ssh/authorized_keys`：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

再把私钥内容保存到 GitHub Secret `ALIYUN_SSH_KEY`。

---

## 4. Nginx 配置

在服务器创建站点配置，例如：

`/etc/nginx/sites-available/reader.hhhhz.online`

```nginx
server {
    listen 80;
    server_name reader.hhhhz.online;

    root /var/www/reader;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/reader.hhhhz.online /etc/nginx/sites-enabled/reader.hhhhz.online
sudo nginx -t
sudo systemctl reload nginx
```

`try_files $uri $uri/ /index.html;` 是必须的，因为这是 React Router 前端路由站点。

---

## 5. 首次部署检查

首次上线前，建议本地先确认：

```bash
npm ci
npm run typecheck
npm test
npm run build
```

首次 push 后，到 GitHub Actions 页面确认工作流成功，再登录服务器检查：

```bash
ls -la /var/www/reader
```

如果 Nginx 已配置成功，访问：

- [http://reader.hhhhz.online](http://reader.hhhhz.online)

---

## 6. 常见故障

### 6.1 工作流能连通 SSH，但上传失败

优先检查：

- `ALIYUN_USER` 是否有写入 `/tmp` 和 `/var/www/reader` 的权限
- 服务器是否安装了 `rsync`

### 6.2 页面打开 404 或刷新子路由 404

通常是 Nginx 没有加：

```nginx
try_files $uri $uri/ /index.html;
```

### 6.3 页面没更新

在服务器执行：

```bash
find /var/www/reader -maxdepth 2 -type f | head
```

再核对 GitHub Actions 日志中是否已经完成：

- `Build`
- `Upload dist package`
- `Deploy on server`

### 6.4 `known_hosts` 或 SSH 指纹失败

如果服务器重装过，GitHub Actions 里的 `ssh-keyscan` 记录会变化。重新触发工作流即可；若 SSH 主机名变更，更新 `ALIYUN_HOST`。

---

## 7. 后续建议

当前方案先满足自动发布。后续建议再做两件事：

1. 给 `reader.hhhhz.online` 配 HTTPS
2. 给服务器补 `swap`，提升整体稳定性

如果后面你想把内容更新和代码发布拆开，也可以继续沿用这条链路，只要提交进仓库的仍然是最终可发布内容即可。
