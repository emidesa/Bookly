import type { JSX } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { SymbolView } from 'expo-symbols';
import { useThemeColors } from '../theme/useThemeColors';

interface DateFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date; // ex. aujourd'hui : pas de date future
}

// « 12 mai 2025 »
function formatLongDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Champ date : sélecteur compact intégré sur iPhone, calendrier en boîte de dialogue sur Android
export default function DateField({ label, value, onChange, maximumDate }: DateFieldProps): JSX.Element {
  const colors = useThemeColors();
  const rowStyle = [styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.inputBorder }];

  // Icône décorative : le libellé suffit aux lecteurs d'écran
  const icon = (
    <View accessible={false} importantForAccessibility="no-hide-descendants">
      <SymbolView name={{ ios: 'calendar', android: 'calendar_today' }} size={20} tintColor={colors.textSecondary} />
    </View>
  );

  // Android : la doc recommande l'API impérative (comme une alerte)
  function openAndroidPicker(): void {
    DateTimePickerAndroid.open({
      value: value,
      mode: 'date',
      maximumDate: maximumDate,
      onValueChange: (_event, date) => onChange(date),
    });
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {Platform.OS === 'ios' ? (
        <View style={rowStyle}>
          {icon}
          <DateTimePicker
            value={value}
            mode="date"
            display="compact"
            locale="fr-FR"
            maximumDate={maximumDate}
            accentColor={colors.primary}
            onValueChange={(_event, date) => onChange(date)}
          />
        </View>
      ) : (
        <Pressable
          onPress={openAndroidPicker}
          accessibilityRole="button"
          accessibilityLabel={label + ' : ' + formatLongDate(value)}
          accessibilityHint="Ouvre le calendrier"
          style={rowStyle}
        >
          {icon}
          <Text style={[styles.value, { color: colors.text }]}>{formatLongDate(value)}</Text>
        </Pressable>
      )}
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
  value: {
    fontSize: 16,
  },
});
