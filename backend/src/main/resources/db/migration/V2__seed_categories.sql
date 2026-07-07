-- 初始类目数据：使用 upsert 保持本地反复启动和测试环境初始化幂等。
insert into categories (id, name, sort, created_at, updated_at)
	values (1, '教材', 10, current_timestamp, current_timestamp)
	on duplicate key update name = values(name), sort = values(sort), updated_at = values(updated_at);
insert into categories (id, name, sort, created_at, updated_at)
	values (2, '数码', 20, current_timestamp, current_timestamp)
	on duplicate key update name = values(name), sort = values(sort), updated_at = values(updated_at);
insert into categories (id, name, sort, created_at, updated_at)
	values (3, '宿舍用品', 30, current_timestamp, current_timestamp)
	on duplicate key update name = values(name), sort = values(sort), updated_at = values(updated_at);
insert into categories (id, name, sort, created_at, updated_at)
	values (4, '运动器材', 40, current_timestamp, current_timestamp)
	on duplicate key update name = values(name), sort = values(sort), updated_at = values(updated_at);
