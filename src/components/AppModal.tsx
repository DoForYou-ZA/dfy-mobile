import React from 'react'
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native'
import { COLORS, RADIUS, SHADOW } from '../config/theme'

interface Props {
  visible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

// Matches web .modal-overlay + .modal-box + .modal-header + .modal-body + .modal-footer
export default function AppModal({ visible, onClose, title, children, footer }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>
          <TouchableOpacity activeOpacity={1} style={s.box}>
            {/* .modal-header */}
            <View style={s.header}>
              <Text style={s.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={s.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* .modal-body */}
            <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
            {/* .modal-footer */}
            {footer && <View style={s.footer}>{footer}</View>}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  kav: { flex: 1, justifyContent: 'center' },
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    maxHeight: '88%',
    ...SHADOW.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  closeBtn: { padding: 4, borderRadius: RADIUS.sm },
  closeText: { fontSize: 18, color: COLORS.textSecondary },
  body: { padding: 24 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
})
