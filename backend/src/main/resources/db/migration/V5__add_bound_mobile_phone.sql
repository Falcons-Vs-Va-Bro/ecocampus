alter table users
	add column mobile_phone varchar(20) null after phone,
	add constraint uk_users_mobile_phone unique (mobile_phone);
