import { App as AntdApp } from 'antd'
import { CheckCircle2, FolderOpen, FolderTree, PauseCircle, Plus, Search, Trash2 } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  listAdminCategories,
  updateCategory,
  type Category,
  type CategoryRequest,
} from '../../api/category.api'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './AdminWorkspacePages.css'

type Filter = 'all' | 'enabled' | 'disabled'
type CategoryDraft = CategoryRequest & { id?: number }

export function AdminCategoriesPage() {
  useDocumentTitle('厦大闲置 - 类目管理')
  const { message, modal } = AntdApp.useApp()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin', 'categories'], queryFn: listAdminCategories })
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<CategoryDraft | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
  const saveMutation = useMutation({
    mutationFn: (draft: CategoryDraft) => {
      const payload: CategoryRequest = {
        name: draft.name.trim(),
        sort: draft.sort,
        parentId: draft.parentId,
        enabled: draft.enabled ?? true,
      }
      return draft.id ? updateCategory(draft.id, payload) : createCategory(payload)
    },
    onSuccess: () => {
      message.success('类目已保存到数据库')
      setEditing(null)
      refresh()
    },
    onError: (error) => message.error(error instanceof Error ? error.message : '保存失败'),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      message.success('类目已删除')
      refresh()
    },
    onError: (error) => message.error(error instanceof Error ? error.message : '删除失败'),
  })

  const categories = useMemo(() => query.data?.data ?? [], [query.data])
  const roots = useMemo(() => categories.filter((category) => category.parentId == null), [categories])
  const rows = useMemo(
    () => roots
      .flatMap((root) => [root, ...categories.filter((category) => category.parentId === root.id)])
      .filter((category) => !keyword.trim() || category.name.toLowerCase().includes(keyword.trim().toLowerCase()))
      .filter((category) => filter === 'all' || category.enabled === (filter === 'enabled')),
    [categories, filter, keyword, roots],
  )

  function submitSearch(event: FormEvent) {
    event.preventDefault()
  }

  function toggle(category: Category) {
    saveMutation.mutate({
      id: category.id,
      name: category.name,
      sort: category.sort,
      parentId: category.parentId,
      enabled: !category.enabled,
    })
  }

  function confirmDelete(category: Category) {
    modal.confirm({
      title: `删除类目“${category.name}”？`,
      content: '含有商品或子类目的类目会由后端拒绝删除。',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(category.id),
    })
  }

  return (
    <section className="admin-work-page">
      <header className="admin-page-heading">
        <div><h1>类目管理</h1><p>维护真实一级类目、二级类目、启停状态与展示排序</p></div>
      </header>

      <div className="admin-stat-grid">
        <Stat icon={<FolderOpen />} label="一级类目" value={String(roots.length)} />
        <Stat icon={<FolderTree />} label="二级类目" value={String(categories.length - roots.length)} />
        <Stat icon={<CheckCircle2 />} label="启用类目" value={String(categories.filter((item) => item.enabled).length)} />
        <Stat icon={<PauseCircle />} label="禁用类目" value={String(categories.filter((item) => !item.enabled).length)} danger />
      </div>

      <div className="admin-toolbar">
        <form onSubmit={submitSearch}><Search /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索类目名称..." /></form>
        <button className="primary-button" onClick={() => setEditing({ name: '', sort: 99, enabled: true })}><Plus />添加新类目</button>
        <div className="admin-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>全部类目</button>
          <button className={filter === 'enabled' ? 'active' : ''} onClick={() => setFilter('enabled')}>启用中</button>
          <button className={filter === 'disabled' ? 'active' : ''} onClick={() => setFilter('disabled')}>已禁用</button>
        </div>
      </div>

      <div className="admin-content-grid">
        <div className="admin-table-card">
          <h2>分类树状列表</h2>
          {query.isLoading ? <p>正在读取类目数据库…</p> : null}
          {query.isError ? <p role="alert">类目加载失败，请重新刷新。</p> : null}
          {!query.isLoading && !query.isError ? (
            <table>
              <thead><tr><th>类目名称</th><th>商品数</th><th>排序</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {rows.map((category) => (
                  <tr key={category.id}>
                    <td className={category.parentId ? 'child-category' : ''}><FolderOpen /><strong>{category.name}</strong></td>
                    <td>{category.itemCount}</td>
                    <td>{String(category.sort).padStart(2, '0')}</td>
                    <td><span className={`status ${category.enabled ? 'good' : 'muted'}`}>{category.enabled ? '启用' : '已禁用'}</span></td>
                    <td>
                      <button className="line-button" onClick={() => setEditing(toDraft(category))}>编辑</button>
                      {!category.parentId ? <button className="line-button" onClick={() => setEditing({ name: '', sort: category.sort + 1, parentId: category.id, enabled: true })}>新增子类</button> : null}
                      <button className={category.enabled ? 'danger-button' : 'line-button'} disabled={saveMutation.isPending} onClick={() => toggle(category)}>{category.enabled ? '禁用' : '启用'}</button>
                      <button className="danger-button" disabled={deleteMutation.isPending} onClick={() => confirmDelete(category)} aria-label={`删除${category.name}`}><Trash2 size={15} />删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
        <aside className="admin-side-stack">
          <Info title="类目规则" lines={['一级、二级类目均保存到数据库', '禁用类目不会出现在发布页', '有商品或子类目的类目不可删除', '商品数来自真实商品关联', '仅支持两级类目结构']} />
          <Info title="真实能力" lines={['新增类目', '编辑名称与排序', '新增二级类目', '启用或禁用', '安全删除空类目']} />
        </aside>
      </div>

      {editing ? (
        <div className="admin-modal-backdrop" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <h2>{editing.id ? '编辑类目' : '添加新类目'}</h2>
            <label>类目名称</label>
            <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
            <label>上级类目</label>
            <select value={editing.parentId ?? 0} onChange={(event) => setEditing({ ...editing, parentId: Number(event.target.value) || undefined })}>
              <option value="0">一级类目</option>
              {roots.filter((root) => root.id !== editing.id).map((root) => <option value={root.id} key={root.id}>{root.name}</option>)}
            </select>
            <label>排序值</label>
            <input type="number" min="0" max="10000" value={editing.sort} onChange={(event) => setEditing({ ...editing, sort: Number(event.target.value) })} />
            <label>启用状态</label>
            <select value={editing.enabled === false ? 'disabled' : 'enabled'} onChange={(event) => setEditing({ ...editing, enabled: event.target.value === 'enabled' })}>
              <option value="enabled">启用</option><option value="disabled">禁用</option>
            </select>
            <div>
              <button className="primary-button" disabled={saveMutation.isPending} onClick={() => editing.name.trim() ? saveMutation.mutate(editing) : message.warning('请填写类目名称')}>保存修改</button>
              <button className="line-button" onClick={() => setEditing(null)}>取消</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function toDraft(category: Category): CategoryDraft {
  return { id: category.id, name: category.name, sort: category.sort, parentId: category.parentId, enabled: category.enabled }
}

function Stat({ icon, label, value, danger = false }: { icon: React.ReactNode; label: string; value: string; danger?: boolean }) {
  return <div className="admin-stat-card"><span className={danger ? 'danger' : ''}>{icon}</span><div><small>{label}</small><strong className={danger ? 'danger-text' : ''}>{value}</strong></div></div>
}

function Info({ title, lines }: { title: string; lines: string[] }) {
  return <section className="admin-info-card"><h2>{title}</h2>{lines.map((line) => <p key={line}><CheckCircle2 />{line}</p>)}</section>
}
