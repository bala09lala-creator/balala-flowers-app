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
import { ShopLocation } from '../components/ShopLocation';
import { Overline } from '../components/Typography';
import { SHOP } from '../config/shop';
import { useCart } from '../context/CartContext';
import {
  DELIVERY_LABELS,
  DeliveryMethod,
  PAYMENT_LABELS,
  PaymentMethod,
  PaymentStatus,
  PHOTO_LABELS,
  PhotoChannel,
} from '../data/orders';
import { colors, fonts } from '../theme';
import { deliveryCost, formatDeliveryCost } from '../utils/delivery';
import { formatPrice } from '../utils/format';

const TIME_SLOTS = ['9:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00'];

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const label =
      i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
    const value = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
    return { value, label };
  });
}

const options = <T extends string>(labels: Record<T, string>) =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));

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
    <View style={{ gap: 6, flex: 1 }}>
      <Overline>{label}</Overline>
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
            <Text style={[styles.chipText, active && { color: colors.cream }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

export default function CheckoutScreen() {
  const { lines, total, clear } = useCart();
  const days = useMemo(() => nextDays(7), []);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [otherRecipient, setOtherRecipient] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [settlement, setSettlement] = useState('');
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [date, setDate] = useState(days[0].value);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [cardText, setCardText] = useState('');
  const [photo, setPhoto] = useState<PhotoChannel>('whatsapp');
  const [comment, setComment] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('online');
  const [sending, setSending] = useState(false);

  const isDelivery = deliveryMethod !== 'pickup';
  const isOutside = deliveryMethod === 'outside';
  const delivery = deliveryCost(deliveryMethod, total);

  async function onSubmit() {
    const missing = [
      !name.trim() && 'ваше имя',
      phone.replace(/\D/g, '').length < 10 && 'телефон',
      isOutside && !settlement.trim() && 'населённый пункт',
      isDelivery && !street.trim() && 'улицу',
      isDelivery && !house.trim() && 'дом',
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
        deliveryMethod,
        address: isDelivery
          ? {
              settlement: isOutside ? settlement.trim() : undefined,
              street: street.trim(),
              house: house.trim(),
              entrance: entrance.trim(),
              floor: floor.trim(),
              apartment: apartment.trim(),
            }
          : null,
        date,
        timeSlot,
        cardText: cardText.trim(),
        photo,
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
        <Text style={styles.text}>Корзина пуста</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
        <Section title="Ваши данные">
          <Field label="ФИО" value={name} onChangeText={setName} placeholder="Иван Петров" />
          <Field label="Телефон" value={phone} onChangeText={setPhone} placeholder="+7" keyboardType="phone-pad" />
        </Section>

        <Section title="Способ получения">
          <Chips options={options(DELIVERY_LABELS)} value={deliveryMethod} onChange={setDeliveryMethod} />
          {isDelivery ? (
            <>
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
                  <Field label="ФИО получателя" value={recipientName} onChangeText={setRecipientName} />
                  <Field
                    label="Телефон получателя"
                    value={recipientPhone}
                    onChangeText={setRecipientPhone}
                    placeholder="+7"
                    keyboardType="phone-pad"
                  />
                </>
              )}
              {isOutside ? (
                <>
                  <Text style={styles.note}>
                    Доставка за пределы Черкесска платная, стоимость уточнит менеджер после оформления заказа.
                  </Text>
                  <Field label="Населённый пункт" value={settlement} onChangeText={setSettlement} />
                </>
              ) : (
                <>
                  <Text style={styles.text}>Город: {SHOP.city}</Text>
                  <Text style={styles.note}>
                    {delivery === 0
                      ? 'Доставка по городу бесплатная 🎉'
                      : `Доставка ${formatPrice(SHOP.deliveryPrice)}. Бесплатно при заказе от ${formatPrice(SHOP.freeDeliveryFrom)} — добавьте ещё на ${formatPrice(SHOP.freeDeliveryFrom - total)}.`}
                  </Text>
                </>
              )}
              <Field label="Улица" value={street} onChangeText={setStreet} />
              <View style={styles.row}>
                <Field label="Дом" value={house} onChangeText={setHouse} />
                <Field label="Квартира / офис" value={apartment} onChangeText={setApartment} />
              </View>
              <View style={styles.row}>
                <Field label="Подъезд" value={entrance} onChangeText={setEntrance} keyboardType="number-pad" />
                <Field label="Этаж" value={floor} onChangeText={setFloor} keyboardType="number-pad" />
              </View>
            </>
          ) : (
            <ShopLocation />
          )}
          <Overline>{isDelivery ? 'Дата доставки' : 'Дата'}</Overline>
          <Chips options={days} value={date} onChange={setDate} />
          <Overline>{isDelivery ? 'Время доставки' : 'Время'}</Overline>
          <Chips options={TIME_SLOTS.map((t) => ({ value: t, label: t }))} value={timeSlot} onChange={setTimeSlot} />
        </Section>

        <Section title="Пожелания">
          <Field
            label="Записка к букету"
            value={cardText}
            onChangeText={setCardText}
            placeholder="Текст записки (необязательно)"
            multiline
            style={{ minHeight: 70 }}
          />
          <Overline>Отправим фото букета перед отправкой</Overline>
          <Chips options={options(PHOTO_LABELS)} value={photo} onChange={setPhoto} />
          <Field label="Комментарий для флориста / курьера" value={comment} onChangeText={setComment} multiline />
        </Section>

        <Section title="Оплата">
          <Chips options={options(PAYMENT_LABELS)} value={payment} onChange={setPayment} />
        </Section>

        <Section title="Итого">
          <View style={styles.sumRow}>
            <Text style={styles.text}>Товары</Text>
            <Text style={styles.text}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.text}>Доставка</Text>
            <Text style={styles.text}>{formatDeliveryCost(delivery, formatPrice)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.total}>К оплате</Text>
            <Text style={styles.total}>
              {formatPrice(total + (delivery ?? 0))}
              {delivery === null ? ' + доставка' : ''}
            </Text>
          </View>
        </Section>

        <Button
          title={sending ? 'Отправляем…' : payment === 'online' ? 'Перейти к оплате' : 'Оформить заказ'}
          onPress={onSubmit}
          disabled={sending}
        />
        <Text style={styles.hint}>
          Оформляя заказ, вы принимаете условия{' '}
          <Text style={styles.link} onPress={() => Linking.openURL(`${SHOP.website}/oferta`)}>
            оферты
          </Text>
          .
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: {
    backgroundColor: colors.card,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontFamily: fonts.heading, fontSize: 17, letterSpacing: 1, color: colors.text },
  text: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
  hint: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 19, textAlign: 'center' },
  link: { color: colors.primary, textDecorationLine: 'underline' },
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.primary,
    backgroundColor: colors.cream,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  row: { flexDirection: 'row', gap: 10 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.body, color: colors.text, fontSize: 14 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  total: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.primary },
});
