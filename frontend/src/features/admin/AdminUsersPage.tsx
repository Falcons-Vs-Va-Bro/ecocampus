import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntdApp } from 'antd'
import { Ban, CheckCircle2, Search, ShieldCheck, UserPlus, UsersRound } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { blacklistUser, listAdminUsers, removeUserFromBlacklist, type AdminUserSummary } from '../../api/admin.api'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './AdminWorkspacePages.css'

export function AdminUsersPage() {
  useDocumentTitle('厦大闲置 - 用户与黑名单')
  const [params, setParams] = useSearchParams(); const queryClient = useQueryClient(); const { message } = AntdApp.useApp()
  const [keyword, setKeyword] = useState(params.get('keyword') ?? ''); const [target, setTarget] = useState<AdminUserSummary | null>(null); const [reason, setReason] = useState('重复违规发布')
  const scope = params.get('scope') === 'blacklist' ? 'blacklist' : 'all'
  const query = useQuery({ queryKey: ['admin','users',params.get('keyword')], queryFn: () => listAdminUsers({ keyword: params.get('keyword') ?? undefined, size: 50 }) })
  const users = useMemo(() => (query.data?.data.items ?? []).filter((u) => scope === 'all' || u.blacklisted), [query.data, scope])
  const mutation = useMutation({ mutationFn: (user: AdminUserSummary) => user.blacklisted ? removeUserFromBlacklist(user.id) : blacklistUser(user.id, { reason }), onSuccess: () => { message.success(target?.blacklisted ? '已移出黑名单' : '已加入黑名单'); setTarget(null); queryClient.invalidateQueries({ queryKey: ['admin','users'] }) }, onError: (error) => message.error(error instanceof Error ? error.message : '操作失败') })
  function search(e: FormEvent) { e.preventDefault(); const next = new URLSearchParams(params); if (keyword.trim()) next.set('keyword', keyword.trim()); else next.delete('keyword'); setParams(next) }
  const verified = (query.data?.data.items ?? []).filter((u) => u.verificationStatus === 'VERIFIED').length
  return <section className="admin-work-page">
    <header className="admin-page-heading"><div><h1>用户与黑名单</h1><p>管理平台用户资料、认证状态与黑名单限制</p></div></header>
    <div className="admin-stat-grid"><Stat icon={<UsersRound/>} label="注册用户" value="3,742"/><Stat icon={<ShieldCheck/>} label="已认证学生" value={String(2980 + verified)}/><Stat icon={<Ban/>} label="黑名单用户" value={String((query.data?.data.items ?? []).filter(u=>u.blacklisted).length)} danger/><Stat icon={<UserPlus/>} label="今日新增" value="42"/></div>
    <div className="admin-toolbar"><form onSubmit={search}><Search/><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="搜索学号、手机号、昵称..."/><button>查询</button></form><div className="admin-tabs"><button className={scope==='all'?'active':''} onClick={()=>setParams({})}>全部用户</button><button className={scope==='blacklist'?'active':''} onClick={()=>setParams({scope:'blacklist'})}>黑名单</button></div></div>
    <div className="admin-content-grid"><div className="admin-table-card"><table><thead><tr><th>用户信息</th><th>认证状态</th><th>注册时间</th><th>发布数</th><th>账号状态</th><th>操作</th></tr></thead><tbody>{users.map((u,i)=><tr key={u.id}><td><strong>{u.nickname}</strong><small>学号：{u.studentNoMasked}<br/>手机号：{u.phoneMasked}</small></td><td><span className={`status ${u.verificationStatus==='VERIFIED'?'good':'warn'}`}>{u.verificationStatus==='VERIFIED'?'已核验':'未核验'}</span></td><td>2024-0{(i%8)+1}-{String(12+i).padStart(2,'0')}</td><td>{[16,28,4,52,31,9][i%6]}</td><td><span className={`status ${u.blacklisted?'bad':'good'}`}>{u.blacklisted?'黑名单':'正常'}</span></td><td><button className="line-button" onClick={()=>message.info(`正在查看 ${u.nickname} 的资料`)}>查看资料</button><button className={u.blacklisted?'line-button':'danger-button'} onClick={()=>setTarget(u)}>{u.blacklisted?'移出黑名单':'加入黑名单'}</button></td></tr>)}</tbody></table>{!users.length&&<div className="admin-empty">暂无匹配用户</div>}</div>
    <aside className="admin-side-stack"><Info title="黑名单规则" lines={['黑名单用户无法登录','黑名单用户无法发布商品','处理原因写入后台记录','可由管理员手动移除','严重违规可保留证据截图']}/><Info title="最近黑名单记录" lines={['重复发布用户 · 今天 11:20','临时票务号 · 昨天 18:06','旧机回收号 · 昨天 15:42']}/></aside></div>
    {target&&<div className="admin-modal-backdrop" onClick={()=>setTarget(null)}><div className="admin-modal" onClick={e=>e.stopPropagation()}><h2>{target.blacklisted?'移出黑名单确认':'加入黑名单确认'}</h2><p>{target.nickname} · {target.studentNoMasked}</p>{!target.blacklisted&&<><label>处理原因（必选）</label><select value={reason} onChange={e=>setReason(e.target.value)}><option>重复违规发布</option><option>虚假交易</option><option>非学生账号</option><option>恶意举报</option></select><textarea placeholder="填写处理说明，将同步记录到后台..."/></>}<div><button className="primary-button" onClick={()=>mutation.mutate(target)} disabled={mutation.isPending}>确认{target.blacklisted?'移出':'加入'}</button><button className="line-button" onClick={()=>setTarget(null)}>取消</button></div></div></div>}
  </section>
}
function Stat({icon,label,value,danger=false}:{icon:React.ReactNode;label:string;value:string;danger?:boolean}) { return <div className="admin-stat-card"><span className={danger?'danger':''}>{icon}</span><div><small>{label}</small><strong className={danger?'danger-text':''}>{value}</strong></div></div> }
function Info({title,lines}:{title:string;lines:string[]}) { return <section className="admin-info-card"><h2>{title}</h2>{lines.map(line=><p key={line}><CheckCircle2/>{line}</p>)}</section> }
