import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { bankingApi } from '../../api'
import { LoadingScreen, EmptyState } from '../../components/Common'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../../config/theme'
import type { BankAccount, SupportedBank } from '../../types'

const maskAccountNumber = (value: unknown) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? `•••• ${digits.slice(-4)}` : 'Account number unavailable'
}

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

  const setDefault=async(id:number)=>{try{
    const r=await bankingApi.setDefaultPayoutAccount(id)
    if(!r.data?.success){Alert.alert('Unable to update default',r.data?.message||'The account could not be selected.');return}
    Alert.alert('Default payout updated','New runner payouts will use this verified account.');await load()
  }catch(e:any){Alert.alert('Error',e.response?.data?.message||'Failed to update the default payout account.')}}

  const retryVerification=async(id:number)=>{try{const r=await bankingApi.retryVerification(id);if(!r.data?.success){Alert.alert('Verification not complete',r.data?.message||'The bank could not be verified.');await load();return}Alert.alert('Verification updated',r.data?.message||'Bank verification status refreshed.');await load()}catch(e:any){Alert.alert('Verification unavailable',e.response?.data?.message||'Unable to retry bank verification.')}}

  const removeAccount=(id:number)=>Alert.alert('Remove bank account?','This account will be removed from future payout settings. Any payout in progress may prevent removal.',[{text:'Keep account',style:'cancel'},{text:'Remove',style:'destructive',onPress:async()=>{try{const r=await bankingApi.removeBankAccount(id);if(!r.data?.success){Alert.alert('Unable to remove',r.data?.message||'The account could not be removed.');return}await load();Alert.alert('Account removed','The account is no longer available for new payouts.')}catch(e:any){Alert.alert('Unable to remove',e.response?.data?.message||'The account may be linked to a payout in progress.')}}}])

  const save=async()=>{if(!selected||!form.accountNumber||!form.accountHolderName){Alert.alert('Required','Select a bank and complete all fields.');return}
    setSaving(true);try{
      const r=await bankingApi.addBankAccount({...form,bankCode:selected.bankCode,bankGroupId:selected.bankCode,bankName:selected.name,branchCode:selected.branchCode})
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
      accounts.map(a=><View key={a.id} style={s.account}><Text style={s.bank}>{a.bankName}</Text><Text style={s.meta}>{a.accountHolderName} · {maskAccountNumber(a.accountNumber)}</Text><Text style={[s.verified,{color:a.isVerified?COLORS.success:COLORS.danger}]}>{a.isVerified?'✓ Verified':'Not verified for payouts'}</Text>{!a.isVerified&&a.verificationMessage?<Text style={s.verificationMessage}>{a.verificationMessage}</Text>:null}{a.isDefaultPayout?<Text style={s.defaultLabel}>Default payout account</Text>:null}<View style={s.accountActions}>{!a.isDefaultPayout?<TouchableOpacity onPress={()=>a.isVerified?setDefault(a.id):retryVerification(a.id)} style={[s.defaultAction,s.actionButton]} accessibilityRole="button"><Text style={s.defaultActionText}>{a.isVerified?'Set as default payout':'Retry verification'}</Text></TouchableOpacity>:null}<TouchableOpacity onPress={()=>removeAccount(a.id)} style={[s.removeAction,s.actionButton]} accessibilityRole="button"><Text style={s.removeActionText}>Remove account</Text></TouchableOpacity></View></View>)}
    </View>
    <View style={s.card}><Text style={s.heading}>Add account</Text>
      <Text style={s.label}>Bank</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.chips}>{banks.map(b=><TouchableOpacity key={b.bankCode} onPress={()=>setSelected(b)} style={[s.chip,selected?.bankCode===b.bankCode&&s.chipActive]}><Text style={[s.chipText,selected?.bankCode===b.bankCode&&s.chipTextActive]}>{b.name}</Text></TouchableOpacity>)}</View></ScrollView>
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
 account:{borderTopWidth:1,borderTopColor:COLORS.border,paddingVertical:12},accountActions:{flexDirection:'row',alignItems:'stretch',gap:8,marginTop:8},actionButton:{flex:1,alignSelf:'auto',justifyContent:'center',alignItems:'center',minHeight:40},bank:{fontSize:15,fontWeight:'700',color:COLORS.textPrimary},meta:{fontSize:13,color:COLORS.textSecondary,marginTop:3},verified:{fontSize:12,fontWeight:'700',marginTop:5},verificationMessage:{fontSize:12,lineHeight:17,color:COLORS.textSecondary,marginTop:4},defaultLabel:{fontSize:12,fontWeight:'700',color:COLORS.success,marginTop:6},defaultAction:{alignSelf:'flex-start',paddingVertical:8,paddingHorizontal:10,borderRadius:RADIUS.md,borderWidth:1,borderColor:COLORS.primary},defaultActionText:{fontSize:12,fontWeight:'700',color:COLORS.primary},removeAction:{alignSelf:'flex-start',paddingVertical:8,paddingHorizontal:10,borderRadius:RADIUS.md,borderWidth:1,borderColor:COLORS.danger},removeActionText:{fontSize:12,fontWeight:'700',color:COLORS.danger},
 label:{fontSize:13,fontWeight:'600',color:COLORS.textPrimary,marginTop:10,marginBottom:6},input:{borderWidth:1.5,borderColor:COLORS.border,borderRadius:RADIUS.md,padding:12,fontSize:15,color:COLORS.textPrimary,backgroundColor:COLORS.background},
 chips:{flexDirection:'row',gap:8},chip:{paddingHorizontal:12,paddingVertical:8,borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.full},chipActive:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},chipText:{fontSize:12,color:COLORS.textSecondary},chipTextActive:{color:'#fff',fontWeight:'600'}
})
