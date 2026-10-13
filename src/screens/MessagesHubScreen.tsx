import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { messagesApi } from '../api'
import { LoadingScreen, EmptyState } from '../components/Common'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'

type Conversation = { id?: number|string; taskId: string; title?: string; description?: string; taskStatus?: string; chatClosed?: boolean; participantName?: string; lastMessage?: string; lastMessageAt?: string; unreadCount?: number }
const dateLabel = (value?: string) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toDateString() === new Date().toDateString() ? d.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'}) : d.toLocaleDateString('en-ZA',{day:'numeric',month:'short'})
}
const statusLabel = (status?: string, closed?: boolean) => closed ? 'Closed' : ({ claimed:'Active', inprogress:'Active', completed:'Awaiting confirmation', awaitingconfirmation:'Awaiting confirmation', payoutpending:'Payout processing' } as Record<string,string>)[String(status||'').toLowerCase()] || status || 'Conversation'

export default function MessagesHubScreen({navigation}:any) {
  const [items,setItems]=useState<Conversation[]>([])
  const [search,setSearch]=useState('')
  const [loading,setLoading]=useState(true)
  const [refreshing,setRefreshing]=useState(false)
  const [error,setError]=useState('')
  const load=useCallback(async(refresh=false)=>{
    refresh?setRefreshing(true):setLoading(true); setError('')
    try { const r=await messagesApi.getConversations(); setItems(Array.isArray(r.data?.data)?r.data.data:[]) }
    catch(e:any){setError(e.response?.data?.message||'We could not load conversations. Check your connection and try again.')}
    finally{setLoading(false);setRefreshing(false)}
  },[])
  useEffect(()=>{void load()},[load])
  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return q?items.filter(c=>[c.title,c.description,c.participantName,c.taskId].some(v=>String(v||'').toLowerCase().includes(q))):items},[items,search])
  const unread=items.reduce((sum,c)=>sum+Math.max(0,Number(c.unreadCount||0)),0)
  if(loading)return <LoadingScreen message="Loading your conversations..." />
  return <View style={s.page}>
    <View style={s.hero}><Text style={s.eyebrow}>COMMUNICATION</Text><Text style={s.title}>Messages</Text><Text style={s.subtitle}>Keep task conversations in one place. Chats stay attached to the work they belong to.</Text><Text style={s.unread}>{unread} unread</Text></View>
    <View style={s.searchWrap}><TextInput value={search} onChangeText={setSearch} placeholder="Search tasks or people..." placeholderTextColor={COLORS.textMuted} style={s.search} accessibilityLabel="Search conversations"/></View>
    {error? <View style={s.error}><Text style={s.errorTitle}>Messages unavailable</Text><Text style={s.errorText}>{error}</Text><TouchableOpacity onPress={()=>void load()}><Text style={s.link}>Try again</Text></TouchableOpacity></View>:null}
    <FlatList data={filtered} keyExtractor={(c,i)=>String(c.taskId||c.id||i)} contentContainerStyle={s.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>void load(true)} tintColor={COLORS.primary}/>}
      ListEmptyComponent={<View style={s.empty}><EmptyState icon="💬" title={search?'No conversations found':'No conversations yet'} subtitle={search?'Try another search term.':'When you post or accept a task, its conversation will appear here. You can return to this inbox at any time.'}/><TouchableOpacity style={s.browse} onPress={()=>navigation.navigate('BrowseErrands')}><Text style={s.browseText}>Browse tasks</Text></TouchableOpacity></View>}
      renderItem={({item:c})=>{const title=c.title||c.description||'Task conversation';const initials=(c.participantName||'DoForYou').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'DF';return <TouchableOpacity style={[s.row,Number(c.unreadCount||0)>0&&s.unreadRow]} onPress={()=>navigation.navigate('TaskChat',{taskId:c.taskId,title})} accessibilityRole="button" accessibilityLabel={'Open conversation for '+title}>
        <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View><View style={s.rowBody}><View style={s.rowTop}><Text style={s.rowTitle} numberOfLines={1}>{title}</Text><Text style={s.date}>{dateLabel(c.lastMessageAt)}</Text></View><Text style={s.participant} numberOfLines={1}>{c.participantName||'Task participant'} · {statusLabel(c.taskStatus,c.chatClosed)}</Text><Text style={s.message} numberOfLines={2}>{c.lastMessage||'No messages yet. Start the conversation.'}</Text></View>{Number(c.unreadCount||0)>0?<View style={s.badge}><Text style={s.badgeText}>{c.unreadCount}</Text></View>:null}
      </TouchableOpacity>}}
    />
  </View>
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:COLORS.background},hero:{padding:SPACING.lg,backgroundColor:COLORS.primaryLight,borderBottomLeftRadius:24,borderBottomRightRadius:24},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.5,color:COLORS.primaryDark},title:{fontSize:30,fontWeight:'900',color:COLORS.textPrimary,marginTop:5},subtitle:{fontSize:13,lineHeight:20,color:COLORS.textSecondary,marginTop:5},unread:{alignSelf:'flex-start',backgroundColor:COLORS.surface,paddingHorizontal:12,paddingVertical:6,borderRadius:RADIUS.full,marginTop:12,color:COLORS.primaryDark,fontWeight:'800',overflow:'hidden'},searchWrap:{paddingHorizontal:SPACING.md,paddingTop:SPACING.md},search:{backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.md,paddingHorizontal:14,paddingVertical:12,fontSize:14,color:COLORS.textPrimary},list:{padding:SPACING.md,paddingBottom:30,flexGrow:1},row:{flexDirection:'row',alignItems:'center',gap:10,padding:13,backgroundColor:COLORS.surface,borderRadius:RADIUS.lg,borderWidth:1,borderColor:COLORS.border,marginBottom:10,...SHADOW.sm},unreadRow:{borderColor:COLORS.primary},avatar:{width:42,height:42,borderRadius:15,backgroundColor:COLORS.primaryLight,alignItems:'center',justifyContent:'center'},avatarText:{fontSize:13,fontWeight:'900',color:COLORS.primaryDark},rowBody:{flex:1,gap:4},rowTop:{flexDirection:'row',alignItems:'center',gap:8,justifyContent:'space-between'},rowTitle:{flex:1,fontSize:14,fontWeight:'800',color:COLORS.textPrimary},date:{fontSize:10,color:COLORS.textMuted},participant:{fontSize:11,fontWeight:'700',color:COLORS.primaryDark},message:{fontSize:12,lineHeight:17,color:COLORS.textSecondary},badge:{minWidth:22,height:22,borderRadius:11,backgroundColor:COLORS.primary,alignItems:'center',justifyContent:'center',paddingHorizontal:5},badgeText:{fontSize:11,fontWeight:'900',color:COLORS.white},empty:{alignItems:'center',paddingVertical:24},browse:{marginTop:12,paddingHorizontal:18,paddingVertical:11,backgroundColor:COLORS.primary,borderRadius:RADIUS.md},browseText:{fontSize:13,fontWeight:'800',color:COLORS.white},error:{margin:SPACING.md,padding:14,backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.danger,borderRadius:RADIUS.md},errorTitle:{fontSize:14,fontWeight:'800',color:COLORS.danger},errorText:{fontSize:12,lineHeight:18,color:COLORS.textSecondary,marginTop:5},link:{fontSize:12,fontWeight:'800',color:COLORS.primaryDark,marginTop:8}
})
