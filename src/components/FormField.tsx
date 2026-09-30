import { useState, type JSX, type Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useThemeColors } from '../theme/useThemeColors';

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon?: { ios: SFSymbol; android: AndroidSymbol }; // facultative (ex. commentaire)
  hint?: string; // aide affichée sous le champ (ex. règles du mot de passe)
  ref?: Ref<TextInput>;
}

// Champ de formulaire : libellé, icône et saisie ; contour indigo quand il est actif
export default function FormField({ label, icon, hint, ref, onFocus, onBlur, ...inputProps }: FormFieldProps): JSX.Element {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  let borderColor = colors.inputBorder;
  if (isFocused) {
    borderColor = colors.primary;
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          inputProps.multiline && styles.inputRowMultiline,
          { backgroundColor: colors.surface, borderColor: borderColor },
        ]}
      >
        {/* Icône décorative : le libellé suffit aux lecteurs d'écran */}
        {icon ? (
          <View accessible={false} importantForAccessibility="no-hide-descendants">
            <SymbolView name={icon} size={20} tintColor={colors.textSecondary} />
          </View>
        ) : null}
        <TextInput
          ref={ref}
          {...inputProps}
          accessibilityLabel={label}
          accessibilityHint={hint}
          placeholderTextColor={colors.textSecondary}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, inputProps.multiline && styles.inputMultiline, { color: colors.text }]}
        />
      </View>
      {hint ? <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top', // Android : texte en haut du champ
  },
  hint: {
    fontSize: 13,
    marginTop: 6,
  },
});
