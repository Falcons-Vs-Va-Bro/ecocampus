alter table categories add column parent_id bigint null;
alter table categories add column enabled boolean not null default true;
alter table categories
	add constraint fk_categories_parent foreign key (parent_id) references categories(id) on delete restrict;
create index idx_categories_parent on categories(parent_id);
