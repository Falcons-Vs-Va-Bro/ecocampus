-- EcoCampus MySQL demo seed.
--
-- This repeatable Flyway migration is loaded by the default local MySQL config
-- through classpath:db/seed. The prod profile overrides Flyway locations to
-- classpath:db/migration, so production will not import demo rows.
--
-- Notes:
-- - The script is idempotent for repeated local imports by using fixed ID ranges
--   plus upsert/delete-before-insert blocks where needed.
-- - Demo accounts use users.phone-compatible account names starting with
--   2292024 and share the password: demo-password.
-- - Demo image_url values point at frontend public/catalog assets so local,
--   GitHub Pages, and the custom domain can serve the same stable paths.

start transaction;

set @demo_password_hash = '$2a$10$y/HcKWdXluLH0rT2XQhkZ.HQm2WH0TcHJurr9ZVy//6PsJg2vnIqS';

insert into categories (id, name, sort, created_at, updated_at)
values
	(1, '教材', 10, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000'),
	(2, '数码', 20, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000'),
	(3, '宿舍用品', 30, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000'),
	(4, '运动户外', 40, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000'),
	(5, '生活日用', 50, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000'),
	(6, '美妆个护', 60, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000'),
	(7, '乐器文具', 70, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000'),
	(8, '票务转让', 80, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000'),
	(9, '其他', 90, '2026-07-01 09:00:00.000000', '2026-07-10 09:00:00.000000')
on duplicate key update
	name = values(name),
	sort = values(sort),
	updated_at = values(updated_at);

insert into users (
	id, phone, password_hash, nickname, avatar_url, role, verification_status, real_name, student_no, college, grade,
	blacklist_reason, blacklist_expire_at, version, created_at, updated_at
)
values
	(1, '2292024000001', @demo_password_hash, '海风同学', null, 'USER', 'VERIFIED', '林海风', '2024000001', '信息学院', '2024', null, null, 0, '2026-07-01 08:00:00.000000', '2026-07-10 08:00:00.000000'),
	(7, '2292024000007', @demo_password_hash, '李同学', null, 'USER', 'VERIFIED', '李明', '2024000007', '数学科学学院', '2023', null, null, 0, '2026-07-01 08:07:00.000000', '2026-07-10 08:07:00.000000'),
	(8, '2292024000008', @demo_password_hash, '林同学', null, 'USER', 'VERIFIED', '林晓', '2024000008', '经济学院', '2022', null, null, 0, '2026-07-01 08:08:00.000000', '2026-07-10 08:08:00.000000'),
	(9, '2292024000009', @demo_password_hash, '林同学', null, 'USER', 'VERIFIED', '林珊', '2024000009', '新闻传播学院', '2024', null, null, 0, '2026-07-01 08:09:00.000000', '2026-07-10 08:09:00.000000'),
	(10, '2292024000010', @demo_password_hash, '陈同学', null, 'USER', 'VERIFIED', '陈辰', '2024000010', '体育教学部', '2023', null, null, 0, '2026-07-01 08:10:00.000000', '2026-07-10 08:10:00.000000'),
	(11, '2292024000011', @demo_password_hash, '张同学', null, 'USER', 'VERIFIED', '张驰', '2024000011', '电子科学与技术学院', '2021', null, null, 0, '2026-07-01 08:11:00.000000', '2026-07-10 08:11:00.000000'),
	(12, '2292024000012', @demo_password_hash, '刘同学', null, 'USER', 'VERIFIED', '刘宁', '2024000012', '管理学院', '2020', null, null, 0, '2026-07-01 08:12:00.000000', '2026-07-10 08:12:00.000000'),
	(13, '2292024000013', @demo_password_hash, '周同学', null, 'USER', 'VERIFIED', '周舟', '2024000013', '材料学院', '2023', null, null, 0, '2026-07-01 08:13:00.000000', '2026-07-10 08:13:00.000000'),
	(14, '2292024000014', @demo_password_hash, '黄同学', null, 'USER', 'VERIFIED', '黄晴', '2024000014', '艺术学院', '2022', null, null, 0, '2026-07-01 08:14:00.000000', '2026-07-10 08:14:00.000000'),
	(15, '2292024000015', @demo_password_hash, '许同学', null, 'USER', 'VERIFIED', '许夏', '2024000015', '外文学院', '2024', null, null, 0, '2026-07-01 08:15:00.000000', '2026-07-10 08:15:00.000000'),
	(16, '2292024000016', @demo_password_hash, '郑同学', null, 'USER', 'VERIFIED', '郑宇', '2024000016', '海洋与地球学院', '2023', null, null, 0, '2026-07-01 08:16:00.000000', '2026-07-10 08:16:00.000000'),
	(17, '2292024000017', @demo_password_hash, '何同学', null, 'USER', 'VERIFIED', '何安', '2024000017', '法学院', '2022', null, null, 0, '2026-07-01 08:17:00.000000', '2026-07-10 08:17:00.000000'),
	(18, '2292024000018', @demo_password_hash, '宋同学', null, 'USER', 'VERIFIED', '宋远', '2024000018', '信息学院', '2021', null, null, 0, '2026-07-01 08:18:00.000000', '2026-07-10 08:18:00.000000'),
	(22, '2292024000022', @demo_password_hash, '沈同学', null, 'USER', 'VERIFIED', '沈清', '2024000022', '化学化工学院', '2024', null, null, 0, '2026-07-01 08:22:00.000000', '2026-07-10 08:22:00.000000'),
	(23, '2292024000023', @demo_password_hash, '许同学买家', null, 'USER', 'VERIFIED', '许然', '2024000023', '建筑与土木工程学院', '2023', null, null, 0, '2026-07-01 08:23:00.000000', '2026-07-10 08:23:00.000000'),
	(24, '2292024000024', @demo_password_hash, '郑同学买家', null, 'USER', 'VERIFIED', '郑嘉', '2024000024', '生命科学学院', '2022', null, null, 0, '2026-07-01 08:24:00.000000', '2026-07-10 08:24:00.000000'),
	(30, '2292024000030', @demo_password_hash, '违规用户', null, 'USER', 'BLACKLISTED', '吴某', '2024000030', '经济学院', '2021', '疑似批量倒卖耳机，演示黑名单数据', '2026-08-10 23:59:59.000000', 0, '2026-07-01 08:30:00.000000', '2026-07-10 08:30:00.000000'),
	(101, '2292024000101', @demo_password_hash, '海风同学', null, 'USER', 'VERIFIED', '林海风', '2024000101', '信息学院', '2024', null, null, 0, '2026-07-01 08:31:00.000000', '2026-07-10 08:31:00.000000'),
	(900, '2292024000900', @demo_password_hash, '平台管理员', null, 'ADMIN', 'VERIFIED', '管理员', '2024000900', '信息化办公室', '2020', null, null, 0, '2026-07-01 08:32:00.000000', '2026-07-10 08:32:00.000000'),
	(7001, '2292024007001', @demo_password_hash, '审核卖家林同学', null, 'USER', 'VERIFIED', '林森', '2024007001', '经济学院', '2023', null, null, 0, '2026-07-01 08:33:00.000000', '2026-07-10 08:33:00.000000'),
	(7002, '2292024007002', @demo_password_hash, '审核卖家陈同学', null, 'USER', 'VERIFIED', '陈嘉', '2024007002', '数学科学学院', '2022', null, null, 0, '2026-07-01 08:34:00.000000', '2026-07-10 08:34:00.000000'),
	(7003, '2292024007003', @demo_password_hash, '审核卖家许同学', null, 'USER', 'VERIFIED', '许可', '2024007003', '外文学院', '2024', null, null, 0, '2026-07-01 08:35:00.000000', '2026-07-10 08:35:00.000000'),
	(7004, '2292024007004', @demo_password_hash, '审核卖家张同学', null, 'USER', 'VERIFIED', '张沐', '2024007004', '电子科学与技术学院', '2021', null, null, 0, '2026-07-01 08:36:00.000000', '2026-07-10 08:36:00.000000'),
	(7005, '2292024007005', @demo_password_hash, '审核卖家刘同学', null, 'USER', 'VERIFIED', '刘岚', '2024007005', '管理学院', '2020', null, null, 0, '2026-07-01 08:37:00.000000', '2026-07-10 08:37:00.000000')
on duplicate key update
	phone = values(phone),
	password_hash = values(password_hash),
	nickname = values(nickname),
	avatar_url = values(avatar_url),
	role = values(role),
	verification_status = values(verification_status),
	real_name = values(real_name),
	student_no = values(student_no),
	college = values(college),
	grade = values(grade),
	blacklist_reason = values(blacklist_reason),
	blacklist_expire_at = values(blacklist_expire_at),
	updated_at = values(updated_at);

insert into user_addresses (
	id, user_id, receiver_name, receiver_phone, campus_area, detail, default_address, default_owner_id, created_at, updated_at
)
values
	(7001, 101, '林海风', '18800000101', '思明校区', '芙蓉园 3 号楼 101', true, 101, '2026-07-02 10:00:00.000000', '2026-07-10 10:00:00.000000'),
	(7002, 1, '林海风', '18800000001', '思明校区', '嘉庚二楼大厅', true, 1, '2026-07-02 10:05:00.000000', '2026-07-10 10:05:00.000000'),
	(7003, 9, '林珊', '18800000009', '思明校区', '嘉庚二楼大厅', true, 9, '2026-07-02 10:09:00.000000', '2026-07-10 10:09:00.000000'),
	(7004, 11, '张驰', '18800000011', '翔安校区', '学生公寓快递点', true, 11, '2026-07-02 10:11:00.000000', '2026-07-10 10:11:00.000000')
on duplicate key update
	user_id = values(user_id),
	receiver_name = values(receiver_name),
	receiver_phone = values(receiver_phone),
	campus_area = values(campus_area),
	detail = values(detail),
	default_address = values(default_address),
	default_owner_id = values(default_owner_id),
	updated_at = values(updated_at);

insert into items (
	id, seller_id, title, description, category_id, price_cent, status, version, created_at, updated_at
)
values
	(1001, 7, '高等数学（第七版）上下册', '少量笔记，适合期末复习使用。前端 mock 首页与收藏页同款教材。', 1, 2800, 'ON_SALE', 0, '2026-07-01 09:20:00.000000', '2026-07-10 09:20:00.000000'),
	(1002, 8, 'MacBook Air 2019 13 寸', '电池健康 86%，配原装充电器，可在嘉庚二楼自提。', 2, 235000, 'ON_SALE', 0, '2026-06-30 17:45:00.000000', '2026-07-10 09:21:00.000000'),
	(1003, 9, '护眼台灯 可调光', '台灯亮度三档可调，适合宿舍书桌使用，灯头角度可旋转，功能正常。', 3, 4500, 'ON_SALE', 0, '2026-07-06 14:20:00.000000', '2026-07-10 09:22:00.000000'),
	(1004, 10, '斯伯丁篮球 室内外 7 号球', '室内外都可以用，球面磨损轻，适合课余训练。', 4, 6000, 'ON_SALE', 0, '2026-06-29 21:32:00.000000', '2026-07-10 09:23:00.000000'),
	(1005, 11, '机械键盘 青轴', '87 键青轴，键帽完整，空格键略有使用痕迹。', 2, 12000, 'ON_SALE', 0, '2026-06-29 16:05:00.000000', '2026-07-10 09:24:00.000000'),
	(1006, 12, '20 寸行李箱 九成新', '轮子顺滑，拉杆正常，毕业搬宿舍用过两次。', 5, 8000, 'SOLD', 0, '2026-06-28 19:40:00.000000', '2026-07-10 09:25:00.000000'),
	(1007, 13, 'AirPods 二代', '可连接验机，充电盒正常，支持校内配送。', 2, 39900, 'ON_SALE', 0, '2026-06-28 13:16:00.000000', '2026-07-10 09:26:00.000000'),
	(1008, 14, '卡西欧计算器 fx-991CN X', '课程用科学计算器，按键灵敏，附保护壳。', 7, 8500, 'ON_SALE', 0, '2026-06-27 18:22:00.000000', '2026-07-10 09:27:00.000000'),
	(1009, 15, '宿舍收纳箱 三件套', '三件套收纳箱，可叠放，适合宿舍衣物整理。', 3, 3500, 'ON_SALE', 0, '2026-06-26 11:08:00.000000', '2026-07-10 09:28:00.000000'),
	(1010, 16, '羽毛球拍双拍 轻量款', '轻量双拍，附拍套，适合体育课和日常约球。', 4, 6800, 'ON_SALE', 0, '2026-06-25 15:27:00.000000', '2026-07-10 09:29:00.000000'),
	(1011, 17, '考研英语真题 近五年', '卖家已下架，保留用于收藏失效和后台筛选演示。', 1, 1800, 'OFF_SHELF', 0, '2026-06-24 10:00:00.000000', '2026-07-10 09:30:00.000000'),
	(1012, 18, '小米显示器 24 寸', '商品已售出，保留用于收藏失效和后台筛选演示。', 2, 42000, 'SOLD', 0, '2026-06-23 14:51:00.000000', '2026-07-10 09:31:00.000000'),
	(1013, 15, '宿舍床边置物架', '床边置物架，夹扣稳固，适合放书和手机。', 3, 2600, 'ON_SALE', 0, '2026-07-01 12:20:00.000000', '2026-07-10 09:32:00.000000'),
	(1014, 14, '课程用科学计算器', '理工科课程常用型号，功能正常。', 7, 7600, 'ON_SALE', 0, '2026-07-01 13:20:00.000000', '2026-07-10 09:33:00.000000'),
	(1015, 11, '蓝牙键盘便携款', '蓝牙连接稳定，适合平板记笔记。', 2, 9900, 'ON_SALE', 0, '2026-07-01 14:20:00.000000', '2026-07-10 09:34:00.000000'),
	(1016, 10, '篮球训练包 九成新', '可装篮球和球鞋，背带完好。', 4, 5200, 'ON_SALE', 0, '2026-07-01 15:20:00.000000', '2026-07-10 09:35:00.000000'),
	(1017, 14, '演唱会门票转让', '票务转让待审核样本，用于后台审核页。', 8, 58000, 'PENDING_REVIEW', 0, '2026-07-09 10:24:00.000000', '2026-07-10 09:36:00.000000'),
	(1018, 10, '蓝牙音箱 便携款', '便携蓝牙音箱，音质正常，外壳轻微使用痕迹。', 2, 7600, 'ON_SALE', 0, '2026-07-04 13:20:00.000000', '2026-07-10 09:37:00.000000'),
	(1019, 30, '疑似批量耳机转售', '违规治理样本，演示平台下架后的商品。', 2, 19900, 'VIOLATION_REMOVED', 0, '2026-07-03 16:20:00.000000', '2026-07-10 09:38:00.000000'),
	(2001, 101, '卡西欧计算器 fx-991CN X', '海风同学发布的计算器，出售订单演示商品。', 7, 8500, 'ON_SALE', 0, '2026-07-07 10:05:00.000000', '2026-07-10 09:39:00.000000'),
	(2002, 101, '宿舍收纳箱 三件套', '海风同学发布的收纳箱，出售订单演示商品。', 3, 3500, 'ON_SALE', 0, '2026-07-06 19:24:00.000000', '2026-07-10 09:40:00.000000'),
	(2003, 101, '羽毛球拍双拍', '海风同学发布的羽毛球拍，已完成订单演示商品。', 4, 6800, 'SOLD', 0, '2026-07-05 17:15:00.000000', '2026-07-10 09:41:00.000000'),
	(9001, 7001, 'MacBook Air 2019 13 寸', '审核队列样本：电池健康 86%，配原装充电器，可在嘉庚二楼自提。', 2, 268000, 'PENDING_REVIEW', 0, '2026-07-09 10:24:00.000000', '2026-07-10 09:42:00.000000'),
	(9002, 7002, '高等数学（第七版）上下册', '审核队列样本：少量笔记，适合期末复习使用。', 1, 2800, 'PENDING_REVIEW', 0, '2026-07-09 09:58:00.000000', '2026-07-10 09:43:00.000000'),
	(9003, 7003, '宿舍台灯 可调光', '审核队列样本：三挡亮度，外观九成新。', 3, 4500, 'PENDING_REVIEW', 0, '2026-07-09 09:31:00.000000', '2026-07-10 09:44:00.000000'),
	(9004, 7004, '机械键盘 青轴 87 键', '审核队列样本：键帽完整，支持宿舍楼下自提。', 2, 12000, 'PENDING_REVIEW', 0, '2026-07-08 18:18:00.000000', '2026-07-10 09:45:00.000000'),
	(9005, 7005, '20 寸行李箱 九成新', '审核队列样本：轮子顺滑，拉杆正常，毕业搬宿舍用过两次。', 5, 8000, 'PENDING_REVIEW', 0, '2026-07-08 16:42:00.000000', '2026-07-10 09:46:00.000000')
on duplicate key update
	seller_id = values(seller_id),
	title = values(title),
	description = values(description),
	category_id = values(category_id),
	price_cent = values(price_cent),
	status = values(status),
	updated_at = values(updated_at);

delete from item_delivery_modes
where item_id in (
	1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014,
	1015, 1016, 1017, 1018, 1019, 2001, 2002, 2003, 9001, 9002, 9003, 9004, 9005
);

insert into item_delivery_modes (item_id, delivery_mode)
values
	(1001, 'SELF_PICKUP'),
	(1002, 'SELF_PICKUP'),
	(1003, 'SELF_PICKUP'),
	(1003, 'DELIVER_TO_SCHOOL'),
	(1004, 'SELF_PICKUP'),
	(1005, 'SELF_PICKUP'),
	(1005, 'DELIVER_TO_SCHOOL'),
	(1006, 'SELF_PICKUP'),
	(1007, 'DELIVER_TO_SCHOOL'),
	(1008, 'SELF_PICKUP'),
	(1009, 'DELIVER_TO_SCHOOL'),
	(1010, 'SELF_PICKUP'),
	(1011, 'SELF_PICKUP'),
	(1012, 'SELF_PICKUP'),
	(1013, 'SELF_PICKUP'),
	(1013, 'DELIVER_TO_SCHOOL'),
	(1014, 'DELIVER_TO_SCHOOL'),
	(1015, 'SELF_PICKUP'),
	(1016, 'SELF_PICKUP'),
	(1017, 'SELF_PICKUP'),
	(1018, 'DELIVER_TO_SCHOOL'),
	(1019, 'SELF_PICKUP'),
	(2001, 'SELF_PICKUP'),
	(2002, 'DELIVER_TO_SCHOOL'),
	(2003, 'SELF_PICKUP'),
	(9001, 'SELF_PICKUP'),
	(9002, 'SELF_PICKUP'),
	(9003, 'SELF_PICKUP'),
	(9004, 'SELF_PICKUP'),
	(9005, 'SELF_PICKUP');

delete from item_images
where item_id in (
	1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014,
	1015, 1016, 1017, 1018, 1019, 2001, 2002, 2003, 9001, 9002, 9003, 9004, 9005
);

insert into item_images (item_id, sort_order, image_url)
values
	(1001, 0, '/catalog/1001.webp'),
	(1002, 0, '/catalog/1002.webp'),
	(1003, 0, '/catalog/1003.webp'),
	(1003, 1, '/catalog/1003-1.webp'),
	(1003, 2, '/catalog/1003-2.webp'),
	(1003, 3, '/catalog/1003-3.webp'),
	(1004, 0, '/catalog/1004.webp'),
	(1005, 0, '/catalog/1005.webp'),
	(1006, 0, '/catalog/1006.webp'),
	(1007, 0, '/catalog/1007.webp'),
	(1008, 0, '/catalog/1008.webp'),
	(1009, 0, '/catalog/1009.webp'),
	(1010, 0, '/catalog/1010.webp'),
	(1011, 0, '/catalog/1011.webp'),
	(1012, 0, '/catalog/1012.webp'),
	(1013, 0, '/catalog/1013.webp'),
	(1014, 0, '/catalog/1014.webp'),
	(1015, 0, '/catalog/1015.webp'),
	(1016, 0, '/catalog/1016.webp'),
	(1017, 0, '/catalog/1017.webp'),
	(1018, 0, '/catalog/1018.webp'),
	(1019, 0, '/catalog/1019.webp'),
	(2001, 0, '/catalog/2001.webp'),
	(2002, 0, '/catalog/2002.webp'),
	(2003, 0, '/catalog/2003.webp'),
	(9001, 0, '/catalog/9001.webp'),
	(9001, 1, '/catalog/9001-1.webp'),
	(9001, 2, '/catalog/9001-2.webp'),
	(9002, 0, '/catalog/9002.webp'),
	(9002, 1, '/catalog/9002-1.webp'),
	(9002, 2, '/catalog/9002-2.webp'),
	(9003, 0, '/catalog/9003.webp'),
	(9003, 1, '/catalog/9003-1.webp'),
	(9003, 2, '/catalog/9003-2.webp'),
	(9004, 0, '/catalog/9004.webp'),
	(9004, 1, '/catalog/9004-1.webp'),
	(9004, 2, '/catalog/9004-2.webp'),
	(9005, 0, '/catalog/9005.webp'),
	(9005, 1, '/catalog/9005-1.webp'),
	(9005, 2, '/catalog/9005-2.webp');

insert into favorites (id, user_id, item_id, created_at)
values
	(5001, 101, 1001, '2026-07-03 08:20:00.000000'),
	(5002, 101, 1002, '2026-07-03 08:05:00.000000'),
	(5003, 101, 1003, '2026-07-02 22:14:00.000000'),
	(5004, 101, 1004, '2026-07-02 18:36:00.000000'),
	(5005, 101, 1005, '2026-07-02 12:01:00.000000'),
	(5006, 101, 1006, '2026-07-02 09:46:00.000000'),
	(5007, 101, 1007, '2026-07-01 20:11:00.000000'),
	(5008, 101, 1008, '2026-07-01 12:18:00.000000'),
	(5009, 101, 1009, '2026-06-30 22:18:00.000000'),
	(5010, 101, 1010, '2026-06-30 10:09:00.000000'),
	(5011, 101, 1011, '2026-06-29 16:33:00.000000'),
	(5012, 101, 1012, '2026-06-28 20:00:00.000000'),
	(5013, 1, 1003, '2026-07-08 19:18:00.000000'),
	(5014, 1, 1005, '2026-07-07 15:22:00.000000')
on duplicate key update
	user_id = values(user_id),
	item_id = values(item_id),
	created_at = values(created_at);

insert into trade_orders (
	id, item_id, active_item_id, buyer_id, seller_id, delivery_mode, remark, status, version, created_at, updated_at
)
values
	(6101, 1003, 1003, 101, 9, 'SELF_PICKUP', '约在芙蓉园门口自提', 'WAITING_PICKUP', 0, '2026-07-09 09:15:00.000000', '2026-07-09 09:35:00.000000'),
	(6102, 1001, 1001, 101, 7, 'SELF_PICKUP', '确认教材版本和取货时间', 'PENDING_COMMUNICATION', 0, '2026-07-08 20:40:00.000000', '2026-07-08 20:40:00.000000'),
	(6103, 1005, 1005, 101, 11, 'DELIVER_TO_SCHOOL', '等待卖家回复', 'PENDING_COMMUNICATION', 0, '2026-07-08 13:18:00.000000', '2026-07-08 13:18:00.000000'),
	(6104, 1006, null, 101, 12, 'SELF_PICKUP', '完成于 2026-07-06', 'COMPLETED', 0, '2026-07-06 18:30:00.000000', '2026-07-06 19:30:00.000000'),
	(6105, 1007, null, 101, 13, 'DELIVER_TO_SCHOOL', '买家已取消', 'CANCELLED', 0, '2026-07-05 22:12:00.000000', '2026-07-05 22:40:00.000000'),
	(6106, 1004, 1004, 101, 10, 'SELF_PICKUP', '取货：思明南路校门', 'WAITING_PICKUP', 0, '2026-07-04 16:55:00.000000', '2026-07-04 17:10:00.000000'),
	(6201, 2001, 2001, 22, 101, 'SELF_PICKUP', '买家想今晚看实物', 'PENDING_COMMUNICATION', 0, '2026-07-09 10:05:00.000000', '2026-07-09 10:05:00.000000'),
	(6202, 2002, 2002, 23, 101, 'DELIVER_TO_SCHOOL', '已确认配送到海韵园', 'WAITING_PICKUP', 0, '2026-07-08 19:24:00.000000', '2026-07-08 19:44:00.000000'),
	(6203, 2003, null, 24, 101, 'SELF_PICKUP', '完成于 2026-07-07', 'COMPLETED', 0, '2026-07-07 17:15:00.000000', '2026-07-07 18:10:00.000000')
on duplicate key update
	item_id = values(item_id),
	active_item_id = values(active_item_id),
	buyer_id = values(buyer_id),
	seller_id = values(seller_id),
	delivery_mode = values(delivery_mode),
	remark = values(remark),
	status = values(status),
	updated_at = values(updated_at);

insert into conversations (
	id, item_id, user_one_id, user_two_id, last_message, last_message_at, created_at, updated_at
)
values
	(501, 1003, 1, 9, '可以，我带上台灯和充电线', '2026-07-08 19:32:00.000000', '2026-07-08 19:18:00.000000', '2026-07-08 19:32:00.000000'),
	(502, 1001, 1, 7, '可以，嘉庚三楼大厅见', '2026-07-08 10:28:00.000000', '2026-07-07 21:04:00.000000', '2026-07-08 10:28:00.000000'),
	(503, 1007, 1, 13, 'AirPods 支持验机吗', '2026-07-07 18:45:00.000000', '2026-07-07 17:58:00.000000', '2026-07-07 18:45:00.000000'),
	(504, 1004, 1, 10, '篮球最低多少呀', '2026-07-07 18:10:00.000000', '2026-07-07 16:34:00.000000', '2026-07-07 18:10:00.000000'),
	(505, 1005, 1, 11, '还能便宜一点吗？', '2026-07-07 16:32:00.000000', '2026-07-07 15:22:00.000000', '2026-07-07 16:32:00.000000')
on duplicate key update
	item_id = values(item_id),
	user_one_id = values(user_one_id),
	user_two_id = values(user_two_id),
	last_message = values(last_message),
	last_message_at = values(last_message_at),
	updated_at = values(updated_at);

insert into conversation_messages (id, conversation_id, sender_id, content, created_at)
values
	(90001, 501, 9, '这个台灯还在吗？我今晚可以自提', '2026-07-08 19:20:00.000000'),
	(90002, 501, 1, '还在的，可以在嘉庚二楼大厅见', '2026-07-08 19:22:00.000000'),
	(90003, 501, 9, '我想预约自提，时间地点？', '2026-07-08 19:24:00.000000'),
	(90004, 501, 1, '今晚 8 点可以吗？', '2026-07-08 19:27:00.000000'),
	(90005, 501, 9, '可以，我带上台灯和充电线', '2026-07-08 19:32:00.000000'),
	(90011, 502, 1, '同学，高数书还在吗？', '2026-07-08 10:10:00.000000'),
	(90012, 502, 7, '还在，书页没有笔记。', '2026-07-08 10:18:00.000000'),
	(90013, 502, 7, '可以，嘉庚三楼大厅见', '2026-07-08 10:28:00.000000'),
	(90021, 503, 1, 'AirPods 支持验机吗', '2026-07-07 18:45:00.000000'),
	(90031, 504, 1, '篮球最低多少呀', '2026-07-07 18:10:00.000000'),
	(90041, 505, 11, '还能便宜一点吗？', '2026-07-07 16:32:00.000000')
on duplicate key update
	conversation_id = values(conversation_id),
	sender_id = values(sender_id),
	content = values(content),
	created_at = values(created_at);

insert into demands (
	id, user_id, title, description, category_id, budget_min_cent, budget_max_cent, status, version, created_at, updated_at
)
values
	(8001, 101, '求一套高数教材', '希望是第七版上下册，少量笔记可以接受。', 1, 1000, 3500, 'OPEN', 0, '2026-07-08 09:10:00.000000', '2026-07-08 09:10:00.000000'),
	(8002, 1, '想收一个宿舍台灯', '可调光、灯头可旋转优先，预算 60 元以内。', 3, 2000, 6000, 'OPEN', 0, '2026-07-08 11:35:00.000000', '2026-07-08 11:35:00.000000'),
	(8003, 22, '收蓝牙键盘', '平板上课记笔记用，便携款优先。', 2, 5000, 12000, 'MATCHED', 0, '2026-07-07 16:00:00.000000', '2026-07-08 16:00:00.000000'),
	(8004, 23, '求羽毛球拍', '体育课使用，双拍或单拍都可以。', 4, 3000, 8000, 'OPEN', 0, '2026-07-07 17:30:00.000000', '2026-07-07 17:30:00.000000')
on duplicate key update
	user_id = values(user_id),
	title = values(title),
	description = values(description),
	category_id = values(category_id),
	budget_min_cent = values(budget_min_cent),
	budget_max_cent = values(budget_max_cent),
	status = values(status),
	updated_at = values(updated_at);

delete from demand_keywords
where demand_id in (8001, 8002, 8003, 8004);

insert into demand_keywords (demand_id, keyword)
values
	(8001, '高数'),
	(8001, '教材'),
	(8002, '台灯'),
	(8002, '宿舍'),
	(8003, '蓝牙键盘'),
	(8003, '数码'),
	(8004, '羽毛球拍'),
	(8004, '运动');

insert into audit_logs (id, actor_user_id, target_type, target_id, action, remark, created_at)
values
	(30001, 900, 'ITEM', 1019, 'ITEM_VIOLATION_REMOVED', '疑似批量倒卖耳机，演示违规下架记录', '2026-07-09 15:30:00.000000'),
	(30002, 7001, 'ITEM', 9001, 'ITEM_CREATED', 'seller submitted pending review item', '2026-07-09 10:24:00.000000'),
	(30003, 7002, 'ITEM', 9002, 'ITEM_CREATED', 'seller submitted pending review item', '2026-07-09 09:58:00.000000'),
	(30004, 101, 'ORDER', 6101, 'ORDER_CREATED', 'order created from seeded demo data', '2026-07-09 09:15:00.000000')
on duplicate key update
	actor_user_id = values(actor_user_id),
	target_type = values(target_type),
	target_id = values(target_id),
	action = values(action),
	remark = values(remark),
	created_at = values(created_at);

commit;
