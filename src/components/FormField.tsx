import React, { forwardRef, ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fonts, radii } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  prefix?: string; // fixed text box before the input, e.g. "+27"
  right?: ReactNode; // e.g. the password eye button
  containerStyle?: StyleProp<ViewStyle>;
};

/** Label + input + error. One spacing rule for every field in the app. */
const FormField = forwardRef<TextInput, Props>(function FormField(
  { label, error, prefix, right, containerStyle, style, ...inputProps },
  ref,
) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, !!error && styles.boxError]}>
        {!!prefix && (
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
        )}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={label}
          {...inputProps}
        />
        {right}
      </View>
      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
});

export default FormField;

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  boxError: { borderColor: colors.error },
  prefix: {
    height: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.inputBorder,
    backgroundColor: '#FBF6EC',
  },
  prefixText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
