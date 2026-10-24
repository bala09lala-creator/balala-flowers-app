import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ReactNode, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { createOrder, getPaymentStatus } from '../api/client';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { PAYMENT_LABELS, PaymentMethod, PaymentStatus } from '../data/orders';
import { colors, radius } from '../theme';
import { deliveryCost } from '../utils/delivery';
import { formatPrice } from '../utils/format';

const TIME_SLOTS = ['9:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00'];

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const label =
      i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
    return { value: d.toISOString().slice(0, 10), label };
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// После возврата со страницы оплаты ЮKassa может ещё несколько секунд обрабатывать платёж.
async function waitForPayment(paymentId: string): Promise<PaymentStatus['status']> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { status } = await getPaymentStatus(paymentId);
    if (status !== 'pending') return status;
    await sleep(1500);
  }
  return 'pending';
}

function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={[styles.input, style]} {...rest} />
    </View>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && { color: '#fff' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function CheckoutScreen() {
  const { lines, total, clear } = useCart();
  const days = useMemo(() => nextDays(7), []);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otherRecipient, setOtherRecipient] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(days[0].value);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [cardText, setCardText] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('online');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const delivery = deliveryCost(total);

  async function onSubmit() {
    const missing = [
      !name.trim() && 'ваше имя',
      phone.replace(/\D/g, '').length < 10 && 'телефон',
      !address.trim() && 'адрес доставки',
      otherRecipient && !recipientName.trim() && 'имя получателя',
    ].filter(Boolean);
    if (missing.length) {
      Alert.alert('Заполните поля', `Укажите: ${missing.join(', ')}.`);
      return;
    }

    setSending(true);
    try {
      const { orderId, confirmationUrl, paymentId } = await createOrder({
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        customer: { name: name.trim(), phone: phone.trim() },
        recipient: otherRecipient ? { name: recipientName.trim(), phone: recipientPhone.trim() } : null,
        address: address.trim(),
        date,
        timeSlot,
        cardText: cardText.trim(),
        comment: comment.trim(),
        payment,
        returnUrl: Linking.createURL('payment-result'),
      });

      if (payment === 'online') {
        if (!confirmationUrl || !paymentId) throw new Error('Не удалось открыть оплату');
        await WebBrowser.openAuthSessionAsync(confirmationUrl, Linking.createURL('payment-result'));
        const status = await waitForPayment(paymentId);
        if (status === 'canceled') {
          Alert.alert('Оплата не прошла', 'Попробуйте ещё раз или выберите оплату при получении.');
          return;
        }
        if (status === 'pending') {
          Alert.alert('Оплата не завершена', 'Если вы оплатили заказ, мы увидим платёж и перезвоним вам.');
          return;
        }
      }

      clear();
      router.replace({ pathname: '/success', params: { orderId } });
    } catch (error) {
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Не удалось отправить заказ.');
    } finally {
      setSending(false);
    }
  }

  if (lines.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.label}>Корзина пуста</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
        <Section title="Ваши данные">
          <Field label="Имя" value={name} onChangeText={setName} placeholder="Анна" />
          <Field label="Телефон" value={phone} onChangeText={setPhone} placeholder="+7" keyboardType="phone-pad" />
          <View style={styles.switchRow}>
            <Text style={styles.text}>Получатель — другой человек</Text>
            <Switch
              value={otherRecipient}
              onValueChange={setOtherRecipient}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
          {otherRecipient && (
            <>
              <Field label="Имя получателя" value={recipientName} onChangeText={setRecipientName} />
              <Field
                label="Телефон получателя"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                placeholder="+7"
                keyboardType="phone-pad"
              />
            </>
          )}
        </Section>

        <Section title="Доставка">
          <Field
            label="Адрес"
            value={address}
            onChangeText={setAddress}
            placeholder="Улица, дом, квартира"
            multiline
          />
          <Text style={styles.label}>Дата</Text>
          <Chips options={days} value={date} onChange={setDate} />
          <Text style={styles.label}>Время</Text>
          <Chips options={TIME_SLOTS.map((t) => ({ value: t, label: t }))} value={timeSlot} onChange={setTimeSlot} />
        </Section>

        <Section title="Открытка и пожелания">
          <Field
            label="Текст открытки (бесплатно)"
            value={cardText}
            onChangeText={setCardText}
            placeholder="С днём рождения!"
            multiline
            style={{ minHeight: 70 }}
          />
          <Field label="Комментарий к заказу" value={comment} onChangeText={setComment} multiline />
        </Section>

        <Section title="Оплата">
          <Chips
            options={(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((value) => ({
              value,
              label: PAYMENT_LABELS[value],
            }))}
            value={payment}
            onChange={setPayment}
          />
        </Section>

        <Section title="Итого">
          <View style={styles.sumRow}>
            <Text style={styles.text}>Букеты</Text>
            <Text style={styles.text}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.text}>Доставка</Text>
            <Text style={styles.text}>{delivery === 0 ? 'бесплатно' : formatPrice(delivery)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.total}>К оплате</Text>
            <Text style={styles.total}>{formatPrice(total + delivery)}</Text>
          </View>
        </Section>

        <Button title={sending ? 'Отправляем…' : payment === 'online' ? 'Перейти к оплате' : 'Подтвердить заказ'} onPress={onSubmit} disabled={sending} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  label: { fontSize: 13, color: colors.muted },
  text: { fontSize: 15, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  total: { fontSize: 18, fontWeight: '700', color: colors.text },
});
