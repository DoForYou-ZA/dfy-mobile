import React, { useCallback, useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, RefreshControl } from 'react-native'
import { tasksApi, disputesApi, supportApi } from '../api'
import { LoadingScreen, EmptyState } from '../components/Common'
import Button from '../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'
import { useAuth } from '../context/AuthContext'

type Kind = 'payments' | 'disputes' | 'support' | 'activity'
const money=(value:any)=>typeof value==='number'?'R'+value.toLocaleString('en-ZA'):String(value??'—')
const readable=(value:any)=>String(value??'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ')
export default function AccountToolsScreen({route}:any){
 const kind=(route.params?.kind||'payments') as Kind
 const {user}=useAuth()
 const [rows,setRows]=useState<any[]>([])
 const [loading,setLoading]=useState(true)
 const [refreshing,setRefreshing]=useState(false)
 const [subject,setSubject]=useState('')
 const [message,setMessage]=useState('')
 const [category,setCategory]=useState('General')
 const [sending,setSending]=useState(false)
 const title=({payments:'Payment history',disputes:'My disputes',support:'Help & support',activity:'Activity'} as Record<Kind,string>)[kind]||'Account'
 const load=useCallback(async(refresh=false)=>{
   refresh?setRefreshing(true):setLoading(true)
   try{
    const r=kind==='payments'?await tasksApi.getPaymentHistory():kind==='disputes'?await disputesApi.getMy():kind==='support'?await supportApi.getMyTickets():await tasksApi.getRecentActivity(30)
    const data=r.data?.data
    const list=Array.isArray(data)?data:Array.isArray(data?.items)?data.items:Array.isArray(data?.payments)?data.payments:Array.isArray(data?.tickets)?data.tickets:Array.isArray(data?.disputes)?data.disputes:[]
    setRows(list)
   }catch(e:any){Alert.alert('Unable to load',e.response?.data?.message||('Could not load '+title.toLowerCase()+'.'))}
   finally{setLoading(false);setRefreshing(false)}
 },[kind,title])
 useEffect(()=>{void load()},[load])
 const submitTicket=async()=>{
   if(!subject.trim()||!message.trim()){Alert.alert('Details required','Enter a subject and describe how we can help.');return}
   setSending(true)
   try{const r=await supportApi.createTicket({name:user?.name,email:user?.email,subject:subject.trim(),message:message.trim(),category,priority:'Normal'});if(!r.data?.success){Alert.alert('Unable to submit',r.data?.message||'Please try again.');return}Alert.alert('Support request sent',r.data?.message||'Your support request was submitted.');setSubject('');setMessage('');await load(true)}
   catch(e:any){Alert.alert('Unable to submit',e.response?.data?.message||'Please try again later.')}
   finally{setSending(false)}
 }
 if(loading)return <LoadingScreen message={'Loading '+title.toLowerCase()+'...'} />
 return <ScrollView style={s.page} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>void load(true)} tintColor={COLORS.primary}/>} keyboardShouldPersistTaps="handled">
  <View style={s.hero}><Text style={s.eyebrow}>YOUR ACCOUNT</Text><Text style={s.title}>{title}</Text><Text style={s.subtitle}>{kind==='payments'?'Review payment records and their current provider status.':kind==='disputes'?'Track disputes you have raised about tasks.':kind==='support'?'Send a request to the support team and review your previous tickets.':'A timeline of recent task activity.'}</Text></View>
  {kind==='support'?<View style={s.card}><Text style={s.heading}>Contact support</Text><Text style={s.label}>Category</Text><View style={s.chips}>{['General','Payment','Task','Account','Technical'].map(c=><TouchableOpacity key={c} onPress={()=>setCategory(c)} style={[s.chip,category===c&&s.chipActive]}><Text style={[s.chipText,category===c&&s.chipTextActive]}>{c}</Text></TouchableOpacity>)}</View><Text style={s.label}>Subject</Text><TextInput style={s.input} value={subject} onChangeText={setSubject} placeholder="What do you need help with?" placeholderTextColor={COLORS.textMuted}/><Text style={s.label}>Message</Text><TextInput style={[s.input,s.multiline]} value={message} onChangeText={setMessage} multiline textAlignVertical="top" placeholder="Describe the issue. Do not include passwords or full bank details." placeholderTextColor={COLORS.textMuted}/><Button title="Submit support request" onPress={submitTicket} loading={sending} fullWidth/></View>:null}
  {rows.length===0?<View style={s.empty}><EmptyState icon={kind==='payments'?'💳':kind==='disputes'?'⚖️':kind==='support'?'💬':'✦'} title={kind==='payments'?'No payment records yet':kind==='disputes'?'No disputes raised':kind==='support'?'No support tickets yet':'No recent activity'} subtitle={kind==='payments'?'Payment records will appear here when you have task transactions.':kind==='disputes'?'If you raise a dispute on an eligible task, its status will appear here.':kind==='support'?'Submit a support request above and track it here.':'Your task updates will appear here as you use DoForYou.'}/></View>:rows.map((item,index)=>{
 const id=String(item.id??item.taskId??item.reference??index)
 const primary=kind==='payments'?(item.taskName||item.description||item.taskDescription||item.taskId||'Task payment'):kind==='disputes'?(item.taskDescription||item.taskId||'Task dispute'):kind==='support'?(item.subject||item.reference||'Support ticket'):(item.description||item.message||item.title||'Task activity')
 const status=item.status||item.paymentStatus||item.payoutStatus||item.taskStatus||'Recorded'
 const amount=item.amount??item.totalAmount??item.budget??item.payoutAmount
 const date=item.createdAt||item.updatedAt||item.timestamp
 return <View key={id} style={s.row}><View style={s.rowTop}><Text style={s.rowTitle} numberOfLines={2}>{primary}</Text>{amount!==undefined&&amount!==null?<Text style={s.amount}>{money(amount)}</Text>:null}</View><Text style={s.meta}>{[kind==='support'?item.reference:item.category,readable(status),date?new Date(date).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'}):''].filter(Boolean).join(' · ')}</Text>{item.issue?<Text style={s.detail}>{item.issue}</Text>:null}{item.resolution?<Text style={s.detail}>Resolution: {item.resolution}</Text>:null}</View>
 })}
 </ScrollView>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:COLORS.background},content:{paddingBottom:30},hero:{padding:SPACING.lg,backgroundColor:COLORS.primaryLight,borderBottomLeftRadius:24,borderBottomRightRadius:24},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.5,color:COLORS.primaryDark},title:{fontSize:28,fontWeight:'900',color:COLORS.textPrimary,marginTop:5},subtitle:{fontSize:13,lineHeight:20,color:COLORS.textSecondary,marginTop:5},card:{margin:SPACING.md,padding:SPACING.md,backgroundColor:COLORS.surface,borderRadius:RADIUS.lg,borderWidth:1,borderColor:COLORS.border,...SHADOW.sm},heading:{fontSize:17,fontWeight:'800',color:COLORS.textPrimary,marginBottom:8},label:{fontSize:12,fontWeight:'800',color:COLORS.textSecondary,marginTop:12,marginBottom:6},input:{borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.md,padding:12,fontSize:14,color:COLORS.textPrimary,backgroundColor:COLORS.background},multiline:{minHeight:100,marginBottom:12},chips:{flexDirection:'row',flexWrap:'wrap',gap:6},chip:{paddingHorizontal:10,paddingVertical:7,borderRadius:RADIUS.full,borderWidth:1,borderColor:COLORS.border},chipActive:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},chipText:{fontSize:11,color:COLORS.textSecondary},chipTextActive:{color:COLORS.white,fontWeight:'800'},empty:{padding:SPACING.lg},row:{marginHorizontal:SPACING.md,marginTop:10,padding:14,backgroundColor:COLORS.surface,borderRadius:RADIUS.lg,borderWidth:1,borderColor:COLORS.border,...SHADOW.sm},rowTop:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',gap:10},rowTitle:{flex:1,fontSize:14,fontWeight:'800',color:COLORS.textPrimary},amount:{fontSize:13,fontWeight:'900',color:COLORS.primaryDark},meta:{fontSize:11,color:COLORS.textMuted,marginTop:7},detail:{fontSize:12,lineHeight:18,color:COLORS.textSecondary,marginTop:8}})
