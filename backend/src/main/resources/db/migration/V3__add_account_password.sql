-- 账号暂复用 users.phone 作为唯一登录标识，以兼容既有数据和管理查询；密码只保存 BCrypt 哈希。
alter table users add column password_hash varchar(100);
