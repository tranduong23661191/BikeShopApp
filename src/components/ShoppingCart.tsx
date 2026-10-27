import { useEffect, useState } from 'react';
import {
    Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../reduxHooks';
import { selectCartSummary } from '../slices/cartSelectors';
import {
    addToCart,
    applyDiscount,
    clearCart,
    decreaseQuantity,
    increaseQuantity,
    removeFromCart,
    setShippingCost,
} from '../slices/cartSlice';
import {
    Product,
    addProduct,
    deleteProduct,
    fetchProducts,
    updateProduct,
} from '../slices/productsSlice';

const Btn = ({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) => (
  <Pressable onPress={onPress} disabled={disabled} style={[s.btn, disabled && { opacity: 0.5 }]}>
    <Text style={s.btnText}>{label}</Text>
  </Pressable>
);

export default function ShoppingCart() {
  const dispatch = useAppDispatch();
  const { items: products, status, error, deletingId } = useAppSelector((st) => st.products);
  const cartItems = useAppSelector((st) => st.cart.items);
  const shippingCost = useAppSelector((st) => st.cart.shippingCost);
  const summary = useAppSelector(selectCartSummary);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [status, dispatch]);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price) return;
    try {
      if (editingId !== null) {
        const old = products.find((p) => p.id === editingId)!;
        await dispatch(updateProduct({ ...old, title, price: Number(price) })).unwrap();
      } else {
        await dispatch(addProduct({ title, price: Number(price), thumbnail: '' })).unwrap();
      }
      resetForm();
    } catch (err) {
      Alert.alert('Thao tác thất bại', (err as Error).message);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setPrice(String(p.price));
  };

  if (status === 'loading') return <Text style={s.center}>Đang tải...</Text>;
  if (status === 'failed') return <Text style={s.center}>Lỗi: {error}</Text>;

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.h1}>🛍️ Cửa Hàng</Text>

      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Tên sản phẩm" />
      <TextInput style={s.input} value={price} onChangeText={setPrice} placeholder="Giá" keyboardType="numeric" />
      <View style={s.row}>
        <Btn label={editingId !== null ? 'Cập nhật' : 'Thêm'} onPress={handleSubmit} />
        {editingId !== null && <Btn label="Hủy" onPress={resetForm} />}
      </View>

      <Text style={s.h2}>Sản phẩm</Text>
      {products.map((p) => (
        <View key={p.id} style={s.card}>
          <View style={s.row}>
            {!!p.thumbnail && <Image source={{ uri: p.thumbnail }} style={{ width: 40, height: 40 }} />}
            <Text style={{ flex: 1 }}>{p.title} - ${p.price}</Text>
          </View>
          <View style={s.row}>
            <Btn label="Thêm vào giỏ" onPress={() => dispatch(addToCart(p))} />
            <Btn label="Sửa" onPress={() => startEdit(p)} />
            <Btn
              label={deletingId === p.id ? 'Đang xóa...' : 'Xóa'}
              disabled={deletingId === p.id}
              onPress={() => dispatch(deleteProduct(p.id))}
            />
          </View>
        </View>
      ))}

      <Text style={s.h2}>Giỏ hàng ({summary.itemCount})</Text>
      {cartItems.length === 0 && <Text>Giỏ hàng trống</Text>}
      {cartItems.map((i) => (
        <View key={i.id} style={s.card}>
          <Text>{i.title} — ${i.price}</Text>
          <View style={s.row}>
            <Btn label="-" onPress={() => dispatch(decreaseQuantity(i.id))} />
            <Text>{i.quantity}</Text>
            <Btn label="+" onPress={() => dispatch(increaseQuantity(i.id))} />
            <Text>= ${(i.price * i.quantity).toFixed(2)}</Text>
            <Btn label="Xóa" onPress={() => dispatch(removeFromCart(i.id))} />
          </View>
        </View>
      ))}
      {cartItems.length > 0 && <Btn label="Xóa tất cả" onPress={() => dispatch(clearCart())} />}

      <Text style={s.h2}>Mã giảm giá</Text>
      <View style={s.row}>
        <Btn label="SUMMER10" onPress={() => dispatch(applyDiscount('SUMMER10'))} />
        <Btn label="SPECIAL20" onPress={() => dispatch(applyDiscount('SPECIAL20'))} />
        <Btn label="Bỏ mã" onPress={() => dispatch(applyDiscount(null))} />
      </View>

      <Text style={s.h2}>Vận chuyển</Text>
      <View style={s.row}>
        {[['Miễn phí', 0], ['Tiêu chuẩn', 10], ['Nhanh', 25]].map(([label, cost]) => (
          <Pressable
            key={label}
            onPress={() => dispatch(setShippingCost(cost as number))}
            style={[s.btn, shippingCost === cost && { backgroundColor: '#16a34a' }]}
          >
            <Text style={s.btnText}>{label} (${cost})</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.h2}>Tóm tắt đơn hàng</Text>
      <Text>Tạm tính: ${summary.subtotal.toFixed(2)}</Text>
      {summary.discount > 0 && <Text>Giảm giá: -${summary.discount.toFixed(2)}</Text>}
      <Text>Thuế (10%): ${summary.tax.toFixed(2)}</Text>
      <Text>Vận chuyển: ${summary.shipping.toFixed(2)}</Text>
      <Text style={s.total}>Thành tiền: ${summary.total.toFixed(2)}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingTop: 50, gap: 8 },
  center: { marginTop: 80, textAlign: 'center' },
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, gap: 6 },
  btn: { backgroundColor: '#2563eb', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  btnText: { color: '#fff' },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
});