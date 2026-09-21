import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { bankingApi } from '../../api'
import { LoadingScreen, EmptyState } from '../../components/Common'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../../config/theme'
import type { BankAccount, SupportedBank } from '../../types'

export default function BankAccountsScreen() {
  const [accounts,setAccounts]=useState<BankAccount[]>([])
  const [banks,setBanks]=useState<SupportedBank[]>([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [selected,setSelected]=useState<SupportedBank|null>(null)
  const [form,setForm]=useState({accountNumber:'',accountHolderName:'',accountType:'Savings'})

  const load=async()=>{try{
    const [a,b]=await Promise.all([bankingApi.getBankAccounts(),bankingApi.getBanks()])
    setAccounts(a.data?.data||[]); setBanks(b.data?.data||[])
  }catch{Alert.alert('Error','Unable to load banking details.')}finally{setLoading(false)}}
  useEffect(()=>{load()},[])

  const save=async()=>{if(!selected||!form.accountNumber||!form.accountHolderName){Alert.alert('Required','Select a bank and complete all fields.');return}
    setSaving(true);try{
      const r=await bankingApi.addBankAccount({...form,bankGroupId:selected.bankGroupId,bankName:selected.name,branchCode:selected.branchCode})
      if(!r.data?.success){Alert.alert('Bank account not verified',r.data?.message||'Verification failed.');return}
      Alert.alert('Success','Bank account verified and ready for direct runner payouts.')
      setForm({accountNumber:'',accountHolderName:'',accountType:'Savings'});setSelected(null);await load()
    }catch(e:any){Alert.alert('Error',e.response?.data?.message||'Failed to add bank account.')}
    finally{setSaving(false)}
  }

  if(loading)return <LoadingScreen message="Loading bank accounts..." />
  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <View style={s.header}><Text style={s.title}>Bank Accounts</Text><Text style={s.sub}>Verified accounts receive direct task payouts. Wallet withdrawals are retired.</Text></View>
    <View style={s.card}><Text style={s.heading}>Your accounts</Text>
      {accounts.length===0?<EmptyState icon="🏦" title="No bank account" subtitle="Add and verify a bank account for runner payouts."/>:
      accounts.map(a=><View key={a.id} style={s.account}><Text style={s.bank}>{a.bankName}</Text><Text style={s.meta}>{a.accountHolderName} · {a.accountNumber}</Text><Text style={[s.verified,{color:a.isVerified?COLORS.success:COLORS.danger}]}>{a.isVerified?'✓ Verified':'Not verified'}</Text></View>)}
    </View>
    <View style={s.card}><Text style={s.heading}>Add account</Text>
      <Text style={s.label}>Bank</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.chips}>{banks.map(b=><TouchableOpacity key={b.bankGroupId} onPress={()=>setSelected(b)} style={[s.chip,selected?.bankGroupId===b.bankGroupId&&s.chipActive]}><Text style={[s.chipText,selected?.bankGroupId===b.bankGroupId&&s.chipTextActive]}>{b.name}</Text></TouchableOpacity>)}</View></ScrollView>
      <Text style={s.label}>Account holder</Text><TextInput style={s.input} value={form.accountHolderName} onChangeText={v=>setForm(f=>({...f,accountHolderName:v}))}/>
      <Text style={s.label}>Account number</Text><TextInput style={s.input} value={form.accountNumber} onChangeText={v=>setForm(f=>({...f,accountNumber:v.replace(/\D/g,'')}))} keyboardType="numeric"/>
      <Text style={s.label}>Account type</Text><TextInput style={s.input} value={form.accountType} onChangeText={v=>setForm(f=>({...f,accountType:v}))}/>
      <Button title="Add & Verify Account" onPress={save} loading={saving} fullWidth style={{marginTop:8}}/>
    </View>
  </ScrollView>
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:COLORS.background},content:{paddingBottom:32},
 header:{backgroundColor:COLORS.primary,padding:SPACING.lg},title:{fontSize:26,fontWeight:'700',color:'#fff'},sub:{fontSize:14,color:'rgba(255,255,255,.85)',marginTop:4},
 card:{backgroundColor:COLORS.surface,borderRadius:RADIUS.xl,padding:SPACING.md,margin:SPACING.md,...SHADOW.sm},heading:{fontSize:18,fontWeight:'700',color:COLORS.textPrimary,marginBottom:12},
 account:{borderTopWidth:1,borderTopColor:COLORS.border,paddingVertical:12},bank:{fontSize:15,fontWeight:'700',color:COLORS.textPrimary},meta:{fontSize:13,color:COLORS.textSecondary,marginTop:3},verified:{fontSize:12,fontWeight:'700',marginTop:5},
 label:{fontSize:13,fontWeight:'600',color:COLORS.textPrimary,marginTop:10,marginBottom:6},input:{borderWidth:1.5,borderColor:COLORS.border,borderRadius:RADIUS.md,padding:12,fontSize:15,color:COLORS.textPrimary,backgroundColor:COLORS.background},
 chips:{flexDirection:'row',gap:8},chip:{paddingHorizontal:12,paddingVertical:8,borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.full},chipActive:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},chipText:{fontSize:12,color:COLORS.textSecondary},chipTextActive:{color:'#fff',fontWeight:'600'}
})
