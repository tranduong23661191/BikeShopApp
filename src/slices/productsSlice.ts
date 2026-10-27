import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
}
export type ProductInput = Omit<Product, 'id'>;

const API = 'https://dummyjson.com/products';

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Lỗi ${res.status}`);
  return res.json();
};

const withBody = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// READ (GET)
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const data = await request<{ products: Product[] }>(
    `${API}?limit=12&select=title,price,thumbnail`
  );
  return data.products;
});

// CREATE (POST)
export const addProduct = createAsyncThunk('products/addProduct', async (input: ProductInput) => {
  await request(`${API}/add`, withBody('POST', input));
  return { ...input, id: Date.now() } as Product;
});

// UPDATE (PUT)
export const updateProduct = createAsyncThunk('products/updateProduct', async (p: Product) => {
  await request(`${API}/${p.id}`, withBody('PUT', p));
  return p;
});

// DELETE
export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id: number) => {
  await request(`${API}/${id}`, { method: 'DELETE' });
  return id;
});

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  deletingId: number | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
  deletingId: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const i = state.items.findIndex((p) => p.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(deleteProduct.pending, (state, action) => {
        state.deletingId = action.meta.arg;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deletingId = null;
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state) => {
        state.deletingId = null;
      });
  },
});

export default productsSlice.reducer;