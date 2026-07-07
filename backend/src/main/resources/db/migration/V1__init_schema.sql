-- 使用 Flyway 管理数据库结构，避免不同环境依赖启动时自动执行 schema.sql。
-- 下面的约束既服务 H2 本地开发，也作为 MySQL 真实环境的数据完整性兜底。

create table if not exists users (
	id bigint auto_increment primary key,
	phone varchar(20) not null,
	nickname varchar(40) not null,
	avatar_url varchar(500),
	role varchar(20) not null,
	verification_status varchar(30) not null,
	real_name varchar(40),
	student_no varchar(32),
	college varchar(80),
	grade varchar(20),
	blacklist_reason varchar(255),
	blacklist_expire_at timestamp(6),
	version bigint not null default 0,
	created_at timestamp(6) not null,
	updated_at timestamp(6) not null,
	constraint uk_users_phone unique (phone),
	constraint uk_users_student_no unique (student_no),
	-- 角色枚举约束：防止绕过应用层写入未知角色。
	constraint ck_users_role check (role in ('USER', 'ADMIN')),
	-- 校园核验状态约束：交易准入和黑名单判断都依赖该字段。
	constraint ck_users_verification_status check (
		verification_status in ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'BLACKLISTED')
	)
);

create table if not exists categories (
	id bigint auto_increment primary key,
	name varchar(40) not null,
	sort integer not null,
	created_at timestamp(6) not null,
	updated_at timestamp(6) not null,
	constraint uk_categories_name unique (name),
	-- 排序范围约束：与 CategoryRequest 的 0..10000 校验保持一致。
	constraint ck_categories_sort check (sort between 0 and 10000)
);

create table if not exists user_addresses (
	id bigint auto_increment primary key,
	user_id bigint not null,
	receiver_name varchar(40) not null,
	receiver_phone varchar(20) not null,
	campus_area varchar(80) not null,
	detail varchar(255) not null,
	default_address boolean not null,
	default_owner_id bigint,
	created_at timestamp(6) not null,
	updated_at timestamp(6) not null,
	constraint fk_user_addresses_user foreign key (user_id) references users(id) on delete restrict,
	-- 默认地址唯一约束：default_owner_id 只有默认地址才写 user_id，确保每个用户最多一个默认地址。
	constraint uk_user_addresses_default_owner unique (default_owner_id),
	-- 默认地址同步约束：防止 default_address 与 default_owner_id 不一致。
	constraint ck_user_addresses_default_owner check (
		(default_address = true and default_owner_id = user_id)
		or (default_address = false and default_owner_id is null)
	)
);

create table if not exists items (
	id bigint auto_increment primary key,
	seller_id bigint not null,
	title varchar(80) not null,
	description varchar(2000) not null,
	category_id bigint not null,
	price_cent bigint not null,
	status varchar(30) not null,
	version bigint not null default 0,
	created_at timestamp(6) not null,
	updated_at timestamp(6) not null,
	constraint fk_items_seller foreign key (seller_id) references users(id) on delete restrict,
	constraint fk_items_category foreign key (category_id) references categories(id) on delete restrict,
	-- 金额约束：系统金额单位为分，不允许负价。
	constraint ck_items_price_cent check (price_cent >= 0),
	-- 商品状态约束：保护商品审核、上下架和售出状态机。
	constraint ck_items_status check (
		status in ('DRAFT', 'PENDING_REVIEW', 'ON_SALE', 'OFF_SHELF', 'REJECTED',
			'VIOLATION_REMOVED', 'SOLD', 'DELETED')
	)
);

create table if not exists item_delivery_modes (
	item_id bigint not null,
	delivery_mode varchar(40) not null,
	constraint pk_item_delivery_modes primary key (item_id, delivery_mode),
	constraint fk_item_delivery_modes_item foreign key (item_id) references items(id) on delete cascade,
	-- 配送方式枚举约束：防止商品出现接口之外的履约方式。
	constraint ck_item_delivery_modes_mode check (delivery_mode in ('SELF_PICKUP', 'DELIVER_TO_SCHOOL'))
);

create table if not exists item_images (
	item_id bigint not null,
	sort_order integer not null,
	image_url varchar(500) not null,
	constraint pk_item_images primary key (item_id, sort_order),
	constraint fk_item_images_item foreign key (item_id) references items(id) on delete cascade,
	-- 图片排序约束：JPA OrderColumn 使用非负序号，避免重复或非法排序。
	constraint ck_item_images_sort_order check (sort_order >= 0)
);

create table if not exists audit_logs (
	id bigint auto_increment primary key,
	actor_user_id bigint not null,
	target_type varchar(40) not null,
	target_id bigint not null,
	action varchar(80) not null,
	remark varchar(255),
	created_at timestamp(6) not null,
	constraint fk_audit_logs_actor foreign key (actor_user_id) references users(id) on delete restrict
);

create table if not exists favorites (
	id bigint auto_increment primary key,
	user_id bigint not null,
	item_id bigint not null,
	created_at timestamp(6) not null,
	constraint fk_favorites_user foreign key (user_id) references users(id) on delete cascade,
	constraint fk_favorites_item foreign key (item_id) references items(id) on delete cascade,
	-- 收藏唯一约束：同一用户不能重复收藏同一商品。
	constraint uk_favorites_user_item unique (user_id, item_id)
);

create table if not exists trade_orders (
	id bigint auto_increment primary key,
	item_id bigint not null,
	active_item_id bigint,
	buyer_id bigint not null,
	seller_id bigint not null,
	delivery_mode varchar(40) not null,
	remark varchar(255),
	status varchar(40) not null,
	version bigint not null default 0,
	created_at timestamp(6) not null,
	updated_at timestamp(6) not null,
	constraint fk_trade_orders_item foreign key (item_id) references items(id) on delete restrict,
	constraint fk_trade_orders_buyer foreign key (buyer_id) references users(id) on delete restrict,
	constraint fk_trade_orders_seller foreign key (seller_id) references users(id) on delete restrict,
	-- 活跃订单唯一约束：active_item_id 仅在待沟通/待自提时写 item_id，防止同一商品并发产生多个活跃订单。
	constraint uk_trade_orders_active_item unique (active_item_id),
	-- 买卖双方约束：防止用户给自己的商品下单。
	constraint ck_trade_orders_participants check (buyer_id <> seller_id),
	-- 订单状态约束：保护订单状态机。
	constraint ck_trade_orders_status check (
		status in ('PENDING_COMMUNICATION', 'WAITING_PICKUP', 'COMPLETED', 'CANCELLED')
	),
	-- 活跃订单同步约束：活跃状态必须占用 active_item_id，终态必须释放 active_item_id。
	constraint ck_trade_orders_active_item check (
		(status in ('PENDING_COMMUNICATION', 'WAITING_PICKUP') and active_item_id = item_id)
		or (status in ('COMPLETED', 'CANCELLED') and active_item_id is null)
	),
	-- 配送方式枚举约束：订单配送方式必须来自商品支持的业务枚举。
	constraint ck_trade_orders_delivery_mode check (delivery_mode in ('SELF_PICKUP', 'DELIVER_TO_SCHOOL'))
);

create table if not exists conversations (
	id bigint auto_increment primary key,
	item_id bigint not null,
	user_one_id bigint not null,
	user_two_id bigint not null,
	last_message varchar(200),
	last_message_at timestamp(6),
	created_at timestamp(6) not null,
	updated_at timestamp(6) not null,
	constraint fk_conversations_item foreign key (item_id) references items(id) on delete restrict,
	constraint fk_conversations_user_one foreign key (user_one_id) references users(id) on delete restrict,
	constraint fk_conversations_user_two foreign key (user_two_id) references users(id) on delete restrict,
	-- 会话唯一约束：同一商品、同一对用户只保留一个会话。
	constraint uk_conversations_item_users unique (item_id, user_one_id, user_two_id),
	-- 会话参与人排序约束：用较小用户 id 做 user_one_id，避免 A-B 和 B-A 生成两条会话。
	constraint ck_conversations_user_order check (user_one_id < user_two_id)
);

create table if not exists conversation_messages (
	id bigint auto_increment primary key,
	conversation_id bigint not null,
	sender_id bigint not null,
	content varchar(1000) not null,
	created_at timestamp(6) not null,
	constraint fk_conversation_messages_conversation foreign key (conversation_id) references conversations(id) on delete cascade,
	constraint fk_conversation_messages_sender foreign key (sender_id) references users(id) on delete restrict
);

create table if not exists demands (
	id bigint auto_increment primary key,
	user_id bigint not null,
	title varchar(80) not null,
	description varchar(1000) not null,
	category_id bigint not null,
	budget_min_cent bigint,
	budget_max_cent bigint,
	status varchar(30) not null,
	version bigint not null default 0,
	created_at timestamp(6) not null,
	updated_at timestamp(6) not null,
	constraint fk_demands_user foreign key (user_id) references users(id) on delete restrict,
	constraint fk_demands_category foreign key (category_id) references categories(id) on delete restrict,
	-- 求购状态约束：保护求购开启、匹配和关闭状态。
	constraint ck_demands_status check (status in ('OPEN', 'MATCHED', 'CLOSED')),
	-- 预算约束：预算必须为非负，且最低预算不能高于最高预算。
	constraint ck_demands_budget check (
		(budget_min_cent is null or budget_min_cent >= 0)
		and (budget_max_cent is null or budget_max_cent >= 0)
		and (budget_min_cent is null or budget_max_cent is null or budget_min_cent <= budget_max_cent)
	)
);

create table if not exists demand_keywords (
	demand_id bigint not null,
	keyword varchar(40) not null,
	constraint pk_demand_keywords primary key (demand_id, keyword),
	constraint fk_demand_keywords_demand foreign key (demand_id) references demands(id) on delete cascade
);

-- 查询索引：围绕前台列表、我的资源、后台筛选和看板统计建立，避免后续数据增长后全表扫描。
create index idx_user_addresses_user on user_addresses(user_id);
create index idx_categories_sort on categories(sort, id);
create index idx_items_seller_status on items(seller_id, status, created_at);
create index idx_items_status_category on items(status, category_id, created_at);
create index idx_favorites_item on favorites(item_id);
create index idx_trade_orders_buyer_status on trade_orders(buyer_id, status, created_at);
create index idx_trade_orders_seller_status on trade_orders(seller_id, status, created_at);
create index idx_trade_orders_status on trade_orders(status);
create index idx_conversations_user_one on conversations(user_one_id, last_message_at);
create index idx_conversations_user_two on conversations(user_two_id, last_message_at);
create index idx_conversation_messages_conversation on conversation_messages(conversation_id, created_at, id);
create index idx_demands_status_category on demands(status, category_id, created_at);
create index idx_demands_user on demands(user_id, created_at);
