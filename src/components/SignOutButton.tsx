import React, { useState } from 'react'
import { ViewStyle } from 'react-native'
import Button from './Button'
import SignOutDialog from './SignOutDialog'

type Props = {
  onConfirm: () => void | Promise<void>
  style?: ViewStyle
}

/** "Sign Out" button that asks for confirmation with the branded dialog first. */
export default function SignOutButton({ onConfirm, style }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button title="Sign Out" onPress={() => setOpen(true)} variant="primary" fullWidth textStyle={{ color: '#292A2D' }} style={style} />
      <SignOutDialog
        visible={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          void onConfirm()
        }}
      />
    </>
  )
}
