import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native'
import { walletApi } from '../../api'
import { LoadingScreen } from '../../components/Common'
import AppModal from '../../components/AppModal'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../../config/theme'

const BANKS = [
  { name: 'ABSA', code: '632005' }, { name: 'FNB', code: '250655' },
  { name: 'Standard Bank', code: '051001' }, { name: 'Nedbank', code: '198765' },
  { name: 'Capitec', code: '470010' }, { name: 'African Bank', code: '430000' },
]

const fmt = (n: number) => `R${(n || 0).toFixed(2)}`

export default function WalletScreen() {
  const [balance, setBalance] = useState(0)
  const [pending, setPending] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddBank, setShowAddBank] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedBank, setSelectedBank] = useState('')
  const [bankForm, setBankForm] = useState({ bankName: '', accountHolderName: '', accountNumber: '', branchCode: '', accountType: 'Cheque' })
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAccountId, setWithdrawAccountId] = useState('')

  const loadAll = async () => {
    try {
      const [balRes, txRes, bankRes, wdRes] = await Promise.all([
        walletApi.getBalance().catch(() => ({ data: null })),
        walletApi.getTransactions().catch(() => ({ data: null })),
        walletApi.getBankAccounts().catch(() => ({ data: null })),
        walletApi.getPendingWithdrawals().catch(() => ({ data: null })),
      ])
      const d = balRes.data?.data || balRes.data
      setBalance(d?.availableBalance ?? d?.balance ?? 0)
      setPending(d?.pendingPayouts ?? 0)
      setTotalEarned(d?.totalEarned ?? 0)
      setTotalWithdrawn(d?.totalWithdrawn ?? 0)
      const txData = txRes.data?.data
      setTransactions(txData?.items || txData?.transactions || [])
      setBankAccounts(bankRes.data?.data || [])
      setWithdrawals(wdRes.data?.data || [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { loadAll() }, [])
  const onRefresh = () => { setRefreshing(true); loadAll() }

  const handleAddBank = async () => {
    if (!bankForm.bankName || !bankForm.accountHolderName || !bankForm.accountNumber) {
      Alert.alert('Error', 'Please fill in all required fields.'); return
    }
    setActionLoading(true)
    try {
      await walletApi.addBankAccount(bankForm)
      setShowAddBank(false)
      setBankForm({ bankName: '', accountHolderName: '', accountNumber: '', branchCode: '', accountType: 'Cheque' })
      await loadAll()
      Alert.alert('Success', 'Bank account added!')
    } catch { Alert.alert('Error', 'Failed to add bank account.') }
    finally { setActionLoading(false) }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount < 50) { Alert.alert('Error', 'Minimum withdrawal is R50.'); return }
    if (!withdrawAccountId) { Alert.alert('Error', 'Please select a bank account.'); return }
    setActionLoading(true)
    try {
      await walletApi.requestWithdrawal({ amount, bankAccountId: parseInt(withdrawAccountId) })
      setShowWithdraw(false)
      setWithdrawAmount('')
      await loadAll()
      Alert.alert('Success', 'Withdrawal request submitted!')
    } catch { Alert.alert('Error', 'Failed to request withdrawal.') }
    finally { setActionLoading(false) }
  }

  const fee = parseFloat(withdrawAmount) ? Math.max(parseFloat(withdrawAmount) * 0.02, 5) : 0

  if (loading) return <LoadingScreen message="Loading wallet..." />

  const summaryCards = [
    { label: 'Available Balance', value: fmt(balance), color: COLORS.success, icon: '💰' },
    { label: 'Pending Payouts', value: fmt(pending), color: COLORS.warning, icon: '⏳' },
    { label: 'Total Earned', value: fmt(totalEarned), color: COLORS.primary, icon: '📈' },
    { label: 'Total Withdrawn', value: fmt(totalWithdrawn), color: COLORS.textSecondary, icon: '⬇️' },
  ]

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Summary */}
      <View style={styles.summaryGrid}>
        {summaryCards.map((s, i) => (
          <View key={i} style={[styles.summaryCard, { borderTopColor: s.color }]}>
            <Text style={styles.summaryIcon}>{s.icon}</Text>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Bank Accounts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bank Accounts</Text>
          <Button title="+ Add" onPress={() => setShowAddBank(true)} size="sm" />
        </View>
        {bankAccounts.length === 0 ? (
          <Text style={styles.emptyText}>No bank accounts added yet</Text>
        ) : bankAccounts.map((acc: any, i: number) => (
          <View key={i} style={styles.bankRow}>
            <Text style={styles.bankIcon}>🏦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankName}>{acc.bankName}</Text>
              <Text style={styles.bankDetail}>****{acc.accountNumber?.slice(-4)} • {acc.accountType} • {acc.accountHolderName}</Text>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: acc.isVerified ? '#D1FAE5' : '#FEF3C7' }]}>
              <Text style={[styles.verifiedText, { color: acc.isVerified ? '#065F46' : '#92400E' }]}>{acc.isVerified ? 'Verified' : 'Pending'}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Withdraw */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Withdraw Funds</Text>
          <Button title="Withdraw" onPress={() => setShowWithdraw(true)} size="sm" disabled={balance < 50 || bankAccounts.length === 0} />
        </View>
        {balance < 50 && <Text style={styles.hintText}>Minimum withdrawal is R50</Text>}
        {bankAccounts.length === 0 && <Text style={styles.hintText}>Add a bank account to withdraw</Text>}
        {withdrawals.map((w: any, i: number) => (
          <View key={i} style={styles.txRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txAmount}>{fmt(w.amount)}</Text>
              <Text style={styles.txMeta}>Fee: {fmt(w.fee)} • {new Date(w.createdAt).toLocaleDateString('en-ZA')}</Text>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: '#F3F4F6' }]}>
              <Text style={styles.verifiedText}>{w.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : transactions.map((tx: any, i: number) => (
          <View key={i} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: tx.transactionType === 'credit' ? '#D1FAE5' : '#FEE2E2' }]}>
              <Text>{tx.transactionType === 'credit' ? '⬇️' : '⬆️'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
              <Text style={styles.txMeta}>{new Date(tx.createdAt).toLocaleDateString('en-ZA')} • {tx.reference}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.transactionType === 'credit' ? COLORS.success : COLORS.danger }]}>
              {tx.transactionType === 'credit' ? '+' : '-'}{fmt(Math.abs(tx.amount))}
            </Text>
          </View>
        ))}
      </View>

      {/* Add Bank Modal */}
      <AppModal visible={showAddBank} onClose={() => setShowAddBank(false)} title="Add Bank Account"
        footer={
          <>
            <Button title="Cancel" onPress={() => setShowAddBank(false)} variant="outline" style={{ flex: 1 }} />
            <Button title="Add Account" onPress={handleAddBank} loading={actionLoading} style={{ flex: 1 }} />
          </>
        }
      >
        <BankFormFields form={bankForm} onChange={setBankForm} />
      </AppModal>

      {/* Withdraw Modal */}
      <AppModal visible={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds"
        footer={
          <>
            <Button title="Cancel" onPress={() => setShowWithdraw(false)} variant="outline" style={{ flex: 1 }} />
            <Button title="Withdraw" onPress={handleWithdraw} loading={actionLoading} style={{ flex: 1 }} />
          </>
        }
      >
        <View style={{ gap: 12 }}>
          <Text style={styles.formLabel}>Amount (R50 - R10,000)</Text>
          <View style={styles.formInput}>
            <Text style={{ fontSize: 15, color: COLORS.textPrimary }}>{withdrawAmount || 'Enter amount...'}</Text>
          </View>
          <Text style={styles.hintText}>Available: {fmt(balance)}</Text>
          <Text style={styles.formLabel}>Bank Account</Text>
          {bankAccounts.map((a: any) => (
            <View key={a.id} style={[styles.bankRow, withdrawAccountId === String(a.id) && { borderColor: COLORS.primary, borderWidth: 1.5 }]}>
              <Text style={styles.bankName}>{a.bankName} - ****{a.accountNumber?.slice(-4)}</Text>
            </View>
          ))}
          {fee > 0 && (
            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Amount:</Text><Text>{fmt(parseFloat(withdrawAmount) || 0)}</Text></View>
              <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Fee (2%):</Text><Text style={{ color: COLORS.danger }}>-{fmt(fee)}</Text></View>
              <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 6 }]}>
                <Text style={[styles.breakdownLabel, { fontWeight: '700' }]}>You receive:</Text>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{fmt((parseFloat(withdrawAmount) || 0) - fee)}</Text>
              </View>
            </View>
          )}
        </View>
      </AppModal>
    </ScrollView>
  )
}

function BankFormFields({ form, onChange }: any) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary }}>Bank Name *</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {BANKS.map(b => (
          <View key={b.name} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: form.bankName === b.name ? COLORS.primary : COLORS.border, backgroundColor: form.bankName === b.name ? '#EEF2FF' : 'transparent' }}>
            <Text style={{ fontSize: 12, color: form.bankName === b.name ? COLORS.primary : COLORS.textSecondary }}>{b.name}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary }}>Account Holder Name *</Text>
      <View style={{ borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12 }}>
        <Text style={{ fontSize: 14, color: form.accountHolderName ? COLORS.textPrimary : COLORS.textMuted }}>{form.accountHolderName || 'Full name...'}</Text>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary }}>Account Number *</Text>
      <View style={{ borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12 }}>
        <Text style={{ fontSize: 14, color: form.accountNumber ? COLORS.textPrimary : COLORS.textMuted }}>{form.accountNumber || 'Account number...'}</Text>
      </View>
      <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Branch Code: {form.branchCode || 'Auto-filled from bank'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 40, gap: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14, borderTopWidth: 3, ...SHADOW.sm, alignItems: 'center', gap: 4 },
  summaryIcon: { fontSize: 24 },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', padding: 16 },
  hintText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  bankIcon: { fontSize: 20 },
  bankName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  bankDetail: { fontSize: 12, color: COLORS.textSecondary },
  verifiedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  verifiedText: { fontSize: 11, fontWeight: '600' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  txIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  txDesc: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  txMeta: { fontSize: 11, color: COLORS.textMuted },
  txAmount: { fontSize: 14, fontWeight: '700' },
  formLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  formInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12 },
  breakdown: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 12, gap: 6 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 13, color: COLORS.textSecondary },
})
